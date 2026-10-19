import { Inject, NotFoundException } from '@nestjs/common';
import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';
import { LLM_REPOSITORY } from 'src/domain/llm/contracts/I-llm.provider';
import { truncateCourseContent } from 'src/domain/llm/course-content.limits';
import type { CompletionFeedbackResponse } from 'src/domain/llm/types/openai.type';
import { PDF_EXTRACTOR, type IPdfExtractorProvider } from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import type { CourseFile } from 'src/domain/teaching/course-file/types/course-file.type';
import { type Language } from 'src/domain/teaching/session/types/session.type';

export type CompletionFeedbackAnswer = {
  questionText: string;
  score: number;
  studentAnswer?: string;
  missingElements?: string[];
  concepts?: Array<{ name: string; score: number }>;
};

export type GenerateCompletionFeedbackBody = {
  courseId: string;
  total: number;
  score: number;
  courseTitle: string;
  answers: CompletionFeedbackAnswer[];
  studentName?: string;
  language?: Language;
};

export type GenerateCompletionFeedbackLlmInput = Omit<GenerateCompletionFeedbackBody, 'courseId'> & {
  courseContent: string;
  language: Language;
};

const PERFECT_ANSWER_SCORE = 1;
const MAX_NOTIONS = 5;

export class GenerateCompletionFeedbackUseCase {
  constructor(
    @Inject(LLM_REPOSITORY)
    private readonly mistralRepository: ILlmProvider,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(PDF_EXTRACTOR)
    private readonly pdfExtractor: IPdfExtractorProvider,
  ) {}

  async execute(body: GenerateCompletionFeedbackBody): Promise<CompletionFeedbackResponse> {
    const course = await this.courseRepository.getCourseById(body.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const courseFiles = await this.courseFileRepository.getCourseFilesByCourseId(body.courseId);
    const courseContent = await this.getCourseContentFromFiles(courseFiles);

    const language = body.language ?? 'francais';
    const llmResult = await this.mistralRepository.generateCompletionFeedback({
      courseTitle: body.courseTitle || course.title,
      courseContent,
      score: body.score,
      total: body.total,
      answers: body.answers,
      studentName: body.studentName,
      language,
    });

    const llmNotions = this.normalizeNotions(llmResult.notionsToReview ?? []);
    const isPerfectQuiz = this.isPerfectQuiz(body);
    const notionsToReview = isPerfectQuiz
      ? []
      : llmNotions.length > 0
        ? llmNotions
        : this.deriveNotionsFromImperfectAnswers(body.answers ?? []);

    return {
      feedback: llmResult.feedback,
      score: body.score,
      total: body.total,
      notionsToReview,
    };
  }

  private isPerfectQuiz(body: GenerateCompletionFeedbackBody): boolean {
    const percent = body.total > 0 ? (body.score / body.total) * 100 : 0;
    if (percent < 100) {
      return false;
    }
    return (body.answers ?? []).every((answer) => answer.score >= PERFECT_ANSWER_SCORE);
  }

  private async getCourseContentFromFiles(files: CourseFile[]): Promise<string> {
    let combinedText = '';

    for (const file of files) {
      try {
        const buffer = await this.courseFileRepository.getFileBufferFromStorage(file.fileUrl);
        if (!buffer) {
          continue;
        }
        const pdfText = await this.pdfExtractor.extractTextFromPdf(buffer);
        if (pdfText) {
          combinedText += '\n\n--- Contenu du fichier: ' + file.fileName + ' ---\n\n' + pdfText;
        }
      } catch (error) {
        console.error('Error processing PDF for completion feedback:', error);
      }
    }

    if (!combinedText.trim()) {
      throw new BadRequestError('No course file content available for this course.');
    }

    return truncateCourseContent(combinedText.trim()).text;
  }

  private deriveNotionsFromImperfectAnswers(answers: CompletionFeedbackAnswer[]): string[] {
    const imperfectAnswers = answers.filter((answer) => answer.score < PERFECT_ANSWER_SCORE);
    if (imperfectAnswers.length === 0) {
      return [];
    }

    const fromConcepts: string[] = [];
    const fromMissing: string[] = [];
    const fromQuestions: string[] = [];

    for (const answer of imperfectAnswers) {
      for (const concept of answer.concepts ?? []) {
        if (concept.score < PERFECT_ANSWER_SCORE && concept.name.trim()) {
          fromConcepts.push(concept.name);
        }
      }
      for (const missing of answer.missingElements ?? []) {
        if (missing.trim()) {
          fromMissing.push(missing);
        }
      }
      if (answer.questionText.trim()) {
        fromQuestions.push(answer.questionText.trim());
      }
    }

    // Prefer concrete concepts / missing elements; fall back to question topics.
    const preferred = this.normalizeNotions([...fromConcepts, ...fromMissing]);
    if (preferred.length > 0) {
      return preferred.slice(0, MAX_NOTIONS);
    }

    return this.normalizeNotions(fromQuestions).slice(0, MAX_NOTIONS);
  }

  private normalizeNotions(notions: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const notion of notions) {
      const trimmed = notion.trim();
      if (!trimmed) {
        continue;
      }
      const key = trimmed.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(trimmed);
    }
    return result;
  }
}
