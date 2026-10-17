import { NotFoundException } from '@nestjs/common';
import {
  GenerateCompletionFeedbackBody,
  GenerateCompletionFeedbackUseCase,
} from './generate-completion-feedback.use-case';
import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';
import type { IPdfExtractorProvider } from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import type { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import type { CourseFile } from 'src/domain/teaching/course-file/types/course-file.type';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';

describe('GenerateCompletionFeedbackUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundException when course is missing', async () => {
    fixtures.whenCourseNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundException);
    expect(fixtures.openaiRepository.generateCompletionFeedback).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when no course file content is available', async () => {
    fixtures.whenCourseFound();
    fixtures.whenNoCourseFiles();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.openaiRepository.generateCompletionFeedback).not.toHaveBeenCalled();
  });

  it('should extract course content from linked files and return notionsToReview', async () => {
    fixtures.whenCourseFound();
    fixtures.whenCourseFilesExtracted('Chapitre fractions du PDF.');
    fixtures.whenRepositoryReturns({
      feedback: 'Excellent travail !',
      notionsToReview: ['les fractions', '  les fractions ', 'pourcentages'],
    });

    const result = await fixtures.whenExecute();

    expect(result).toEqual({
      feedback: 'Excellent travail !',
      score: fixtures.body.score,
      total: fixtures.body.total,
      notionsToReview: ['les fractions', 'pourcentages'],
    });
    expect(fixtures.courseFileRepository.getCourseFilesByCourseId).toHaveBeenCalledWith(fixtures.body.courseId);
    expect(fixtures.pdfExtractor.extractTextFromPdf).toHaveBeenCalled();
    expect(fixtures.openaiRepository.generateCompletionFeedback).toHaveBeenCalledWith({
      courseTitle: fixtures.body.courseTitle,
      courseContent: '--- Contenu du fichier: cours.pdf ---\n\nChapitre fractions du PDF.',
      score: fixtures.body.score,
      total: fixtures.body.total,
      answers: fixtures.body.answers,
      studentName: fixtures.body.studentName,
      language: 'francais',
    });
  });

  it('should forward an explicit language to the repository', async () => {
    fixtures.whenCourseFound();
    fixtures.whenCourseFilesExtracted('Contenu PDF');
    fixtures.whenRepositoryReturns({ feedback: 'Great job!', notionsToReview: [] });

    await fixtures.whenExecuteWithBody({
      ...fixtures.body,
      language: 'anglais',
    });

    expect(fixtures.openaiRepository.generateCompletionFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'anglais' }),
    );
  });

  it('should propagate repository errors', async () => {
    fixtures.whenCourseFound();
    fixtures.whenCourseFilesExtracted('Contenu PDF');
    fixtures.whenRepositoryThrows(new Error('OpenAI indisponible'));

    await expect(fixtures.whenExecute()).rejects.toThrow('OpenAI indisponible');
  });

  it('should derive notions from imperfect answers when LLM returns none', async () => {
    fixtures.whenCourseFound();
    fixtures.whenCourseFilesExtracted('Contenu PDF');
    fixtures.whenRepositoryReturns({ feedback: 'Courage !', notionsToReview: [] });

    const result = await fixtures.whenExecute();

    expect(result.notionsToReview).toEqual(['inégalités', 'crise financière']);
  });

  it('should fall back to imperfect question texts when no concepts or missing elements', async () => {
    fixtures.whenCourseFound();
    fixtures.whenCourseFilesExtracted('Contenu PDF');
    fixtures.whenRepositoryReturns({ feedback: 'Courage !', notionsToReview: [] });

    const result = await fixtures.whenExecuteWithBody({
      ...fixtures.body,
      answers: [{ questionText: 'Quelles sont les causes de la Révolution ?', score: 0 }],
    });

    expect(result.notionsToReview).toEqual(['Quelles sont les causes de la Révolution ?']);
  });

  it('should return empty notions only when the quiz is perfect at 100%', async () => {
    fixtures.whenCourseFound();
    fixtures.whenCourseFilesExtracted('Contenu PDF');
    fixtures.whenRepositoryReturns({ feedback: 'Parfait !', notionsToReview: ['should be ignored'] });

    const result = await fixtures.whenExecuteWithBody({
      ...fixtures.body,
      score: 5,
      total: 5,
      answers: [
        { questionText: 'Q1', score: 1 },
        { questionText: 'Q2', score: 1 },
      ],
    });

    expect(result.notionsToReview).toEqual([]);
  });
});

class Fixtures {
  public readonly openaiRepository: jest.Mocked<Pick<ILlmProvider, 'generateCompletionFeedback'>>;
  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly pdfExtractor: jest.Mocked<Pick<IPdfExtractorProvider, 'extractTextFromPdf'>>;
  public readonly useCase: GenerateCompletionFeedbackUseCase;

  public readonly courseFile: CourseFile = {
    id: 'file-1',
    courseId: '550e8400-e29b-41d4-a716-446655440000',
    fileName: 'cours.pdf',
    fileUrl: 'courses/file.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly body: GenerateCompletionFeedbackBody = {
    courseId: '550e8400-e29b-41d4-a716-446655440000',
    total: 10,
    score: 8,
    courseTitle: 'Histoire',
    studentName: 'Alex',
    answers: [
      {
        questionText: 'Quelles sont les causes ?',
        score: 0.4,
        missingElements: ['crise financière'],
        concepts: [{ name: 'inégalités', score: 0.5 }],
      },
    ],
  };

  constructor() {
    this.openaiRepository = {
      generateCompletionFeedback: jest.fn(),
    };
    this.courseRepository = createMockCourseRepository();
    this.courseFileRepository = createMockCourseFileRepository();
    this.pdfExtractor = {
      extractTextFromPdf: jest.fn(),
    };
    this.useCase = new GenerateCompletionFeedbackUseCase(
      this.openaiRepository as unknown as ILlmProvider,
      this.courseRepository,
      this.courseFileRepository,
      this.pdfExtractor as unknown as IPdfExtractorProvider,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.body);
  }

  whenExecuteWithBody(body: GenerateCompletionFeedbackBody) {
    return this.useCase.execute(body);
  }

  whenCourseNotFound() {
    this.courseRepository.getCourseById.mockResolvedValue(null);
  }

  whenCourseFound() {
    this.courseRepository.getCourseById.mockResolvedValue({
      id: this.body.courseId,
      sessionId: 'session-1',
      title: this.body.courseTitle,
      description: null,
      contentText: 'Ne doit pas être utilisé',
    });
  }

  whenNoCourseFiles() {
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue([]);
  }

  whenCourseFilesExtracted(text: string) {
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue([this.courseFile]);
    this.courseFileRepository.getFileBufferFromStorage.mockResolvedValue(Buffer.from('pdf-data'));
    this.pdfExtractor.extractTextFromPdf.mockResolvedValue(text);
  }

  whenRepositoryReturns(result: { feedback: string; notionsToReview: string[] }) {
    this.openaiRepository.generateCompletionFeedback.mockResolvedValue(result);
  }

  whenRepositoryThrows(error: Error) {
    this.openaiRepository.generateCompletionFeedback.mockRejectedValue(error);
  }
}
