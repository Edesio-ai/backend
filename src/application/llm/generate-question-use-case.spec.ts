import {
  GenerateQuestionBody,
  GenerateQuestionUseCase,
} from './generate-question-use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import type { GeneratedQuestion } from 'src/domain/llm/types/openai.type';
import { IOpenAiProvider } from 'src/domain/llm/openai/contracts/open-ai.provider';
import { IPdfExtractorProvider } from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import {
  CourseFile,
  CourseWithSession,
} from 'src/domain/teaching/course/types/course.type';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';
import { Question } from 'src/domain/teaching/question/types/question.type';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import type { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import type { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockSelfLearnerCourseFileRepository } from 'src/testing/mock-self-learner-course-file-repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerQuestionRepository } from 'src/testing/mock-self-learner-question-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('GenerateQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when teacher is missing', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.courseRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when session belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.openaiRepository.generateQuestions).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when no content and no files', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher({ contentText: '' });
    fixtures.whenNoFiles();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('should throw BadRequestError when OpenAI returns no questions', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenNoFiles();
    fixtures.whenOpenAiReturnsNoQuestions();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('should generate, delete old questions and insert new ones', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenNoFiles();
    fixtures.whenOpenAiReturnsQuestions();
    fixtures.whenInsertSucceeds();

    const result = await fixtures.whenExecute();

    expect(
      fixtures.questionRepository.deleteCourseQuizQuestions,
    ).toHaveBeenCalledWith(fixtures.body.courseId);
    expect(fixtures.questionRepository.insertQuestions).toHaveBeenCalledWith(
      expect.any(Array),
      fixtures.body.courseId,
    );
    expect(result).toEqual(fixtures.insertedQuestions);
  });

  it('should extract text from PDF files and append to content', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher({ contentText: 'Contenu' });
    fixtures.whenFilesAvailable();
    fixtures.whenPdfExtractorReturnsText('Texte du PDF');
    fixtures.whenOpenAiReturnsQuestions();
    fixtures.whenInsertSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.pdfExtractor.extractTextFromPdf).toHaveBeenCalledTimes(1);
    expect(fixtures.openaiRepository.generateQuestions).toHaveBeenCalledWith(
      expect.stringContaining('Texte du PDF'),
      expect.any(Object),
    );
  });

  it('should continue if PDF processing fails for a file', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher({ contentText: 'Contenu' });
    fixtures.whenFilesAvailable();
    fixtures.whenPdfExtractorThrows();
    fixtures.whenOpenAiReturnsQuestions();
    fixtures.whenInsertSucceeds();

    await expect(fixtures.whenExecute()).resolves.toBeDefined();
  });

  it('should alternate single (QCM) and open questions', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenNoFiles();
    fixtures.whenOpenAiReturnsMixedQuestions();
    fixtures.whenInsertSucceeds();

    await fixtures.whenExecute();

    const insertCall = (
      fixtures.questionRepository.insertQuestions as jest.Mock
    ).mock.calls[0][0] as GeneratedQuestion[];
    expect(insertCall[0].type).toBe('single');
    expect(insertCall[1].type).toBe('open');
    expect(insertCall[2].type).toBe('single');
    expect(insertCall[3].type).toBe('open');
  });

  it('deletes then inserts via self learner question persistence when actor is self-learner', async () => {
    fixtures.whenSelfLearnerActor();
    fixtures.whenSelfLearnerCourseReady();
    fixtures.whenOpenAiReturnsQuestions();
    fixtures.selfLearnerQuestionRepository.deleteSelfLearnerQuestionsByCourseId.mockResolvedValue(
      undefined,
    );
    fixtures.selfLearnerQuestionRepository.insertSelfLearnerQuestions.mockResolvedValue(
      fixtures.insertedSelfLearnerQuestions,
    );

    const result = await fixtures.whenExecute();

    expect(
      fixtures.questionRepository.deleteCourseQuizQuestions,
    ).not.toHaveBeenCalled();
    expect(fixtures.questionRepository.insertQuestions).not.toHaveBeenCalled();
    expect(
      fixtures.selfLearnerQuestionRepository
        .deleteSelfLearnerQuestionsByCourseId,
    ).toHaveBeenCalledWith(fixtures.body.courseId);
    expect(
      fixtures.selfLearnerQuestionRepository.insertSelfLearnerQuestions,
    ).toHaveBeenCalledWith(expect.any(Array), fixtures.body.courseId);
    expect(result).toEqual(fixtures.insertedSelfLearnerQuestions);
  });
});

class Fixtures {
  public readonly body: GenerateQuestionBody = {
    courseId: 'course-1',
    totalQuestions: 4,
    singleCount: 2,
    openedCount: 2,
  };

  public readonly user: AuthUser = {
    id: 'user-1',
    email: 't@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly teacher = {
    id: 'teacher-1',
    name: 'Prof',
    email: 't@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null as string | null,
    availableChatbots: 0,
    supabaseUserId: this.user.id,
  };

  public readonly insertedQuestions: Question[] = [
    {
      id: 'q-1',
      courseId: this.body.courseId,
      type: 'single',
      questionText: 'Q1 ?',
      proposals: ['A', 'B'],
      correctAnswers: ['A'],
      explanation: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      positionOrder: 1,
    },
  ];

  public readonly insertedSelfLearnerQuestions: SelfLearnerQuestion[] = [
    {
      id: 'slq-1',
      courseId: this.body.courseId,
      type: 'single',
      questionText: 'Q1 ?',
      proposals: ['A', 'B'],
      correctAnswers: ['A'],
      explanation: '',
      createdAt: new Date('2026-01-05T12:00:00.000Z'),
    },
  ];

  private readonly generatedSingle: GeneratedQuestion = {
    type: 'single',
    questionText: 'QCM ?',
    keyConcepts: [],
    proposals: ['A', 'B', 'C', 'D'],
    correctAnswers: ['A'],
    explanation: 'Explication',
  };

  private readonly generatedOpen: GeneratedQuestion = {
    type: 'open',
    questionText: 'Ouverte ?',
    keyConcepts: [],
    proposals: [],
    correctAnswers: ['Réponse'],
    explanation: 'Explication',
  };

  private readonly courseFile: CourseFile = {
    id: 'file-1',
    courseId: this.body.courseId,
    fileUrl: 'course-1/doc.pdf',
    fileName: 'doc.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly pdfExtractor: jest.Mocked<IPdfExtractorProvider>;
  public readonly openaiRepository: jest.Mocked<IOpenAiProvider>;
  public readonly questionRepository: jest.Mocked<IQuestionsRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly selfLearnerRepository: jest.Mocked<ISelfLearnerRepository>;
  public readonly selfLearnerCourseRepository: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly selfLearnerCourseFileRepository: jest.Mocked<ISelfLearnerCourseFileRepository>;
  public readonly selfLearnerQuestionRepository: jest.Mocked<ISelfLearnerQuestionRepository>;
  public readonly useCase: GenerateQuestionUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.pdfExtractor = {
      extractTextFromPdf: jest.fn(),
      extractQuestionsToPdf: jest.fn(),
    };
    this.openaiRepository = {
      generateQuestions: jest.fn(),
      evaluateAnswer: jest.fn(),
      generateCompletionFeedback: jest.fn(),
    };
    this.questionRepository = {
      getQuestionById: jest.fn(),
      deleteQuestionById: jest.fn(),
      insertQuestions: jest.fn(),
      insertQuestion: jest.fn(),
      deleteQuestionsByCourseIds: jest.fn(),
      getCourseQuestions: jest.fn(),
      deleteCourseQuizQuestions: jest.fn(),
      updateQuestionById: jest.fn(),
    };
    this.teacherRepository = createMockTeacherRepository();

    this.courseFileRepository = createMockCourseFileRepository();
    this.selfLearnerRepository = createMockSelfLearnerRepository();
    this.selfLearnerCourseRepository = createMockSelfLearnerCourseRepository();
    this.selfLearnerCourseFileRepository =
      createMockSelfLearnerCourseFileRepository();
    this.selfLearnerQuestionRepository =
      createMockSelfLearnerQuestionRepository();

    this.useCase = new GenerateQuestionUseCase(
      this.courseRepository,
      this.pdfExtractor,
      this.openaiRepository,
      this.questionRepository,
      this.teacherRepository,
      this.courseFileRepository,
      this.selfLearnerRepository,
      this.selfLearnerCourseRepository,
      this.selfLearnerCourseFileRepository,
      this.selfLearnerQuestionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.body, this.user);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenCourseWithSessionMatchesTeacher(
    overrides: Partial<CourseWithSession> = {},
  ) {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.body.courseId,
      contentText: 'Contenu du cours',
      session: { teacherId: this.teacher.id, language: 'francais' },
      teachers: {},
      ...overrides,
    });
  }

  whenCourseSessionBelongsToOtherTeacher() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.body.courseId,
      contentText: 'Contenu',
      session: { teacherId: 'other-teacher', language: 'francais' },
      teachers: {},
    });
  }

  whenNoFiles() {
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue([]);
  }

  whenFilesAvailable() {
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue([
      this.courseFile,
    ]);
    this.courseFileRepository.getFileBufferFromStorage.mockResolvedValue(
      Buffer.from('pdf-data'),
    );
  }

  whenPdfExtractorReturnsText(text: string) {
    this.pdfExtractor.extractTextFromPdf.mockResolvedValue(text);
  }

  whenPdfExtractorThrows() {
    this.pdfExtractor.extractTextFromPdf.mockRejectedValue(
      new Error('PDF parse error'),
    );
  }

  whenOpenAiReturnsQuestions() {
    this.openaiRepository.generateQuestions.mockResolvedValue([
      this.generatedSingle,
      this.generatedOpen,
    ]);
  }

  whenOpenAiReturnsMixedQuestions() {
    this.openaiRepository.generateQuestions.mockResolvedValue([
      { ...this.generatedSingle },
      { ...this.generatedSingle },
      { ...this.generatedOpen },
      { ...this.generatedOpen },
    ]);
  }

  whenOpenAiReturnsNoQuestions() {
    this.openaiRepository.generateQuestions.mockResolvedValue([]);
  }

  whenInsertSucceeds() {
    this.questionRepository.deleteCourseQuizQuestions.mockResolvedValue(
      undefined,
    );
    this.questionRepository.insertQuestions.mockResolvedValue(
      this.insertedQuestions,
    );
  }

  whenSelfLearnerActor() {
    (this.user.metadata as { role: string }).role = 'self-learner';
  }

  whenSelfLearnerCourseReady() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue({
      id: 'sl-77',
      supabaseUserId: this.user.id,
      name: 'Apprenant',
      email: 'sl@test.com',
      createdAt: '2026-01-04T10:00:00.000Z',
    });
    this.selfLearnerCourseRepository.getSelfLearnerCourseById.mockResolvedValue(
      {
        id: this.body.courseId,
        selfLearnerId: 'sl-77',
        title: 'Cours perso',
        description: null,
        textContent: 'Contenu du cours perso',
        language: 'francais',
        createdAt: '2026-01-04T12:00:00.000Z',
      },
    );
    this.selfLearnerCourseFileRepository.getSelfLearnerCourseFiles.mockResolvedValue(
      [],
    );
  }
}
