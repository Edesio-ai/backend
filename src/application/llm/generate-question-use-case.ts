import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_REPOSITORY,
  type ICourseRepository,
} from 'src/domain/teaching/course/contracts/i-course.repository';
import { CourseFile } from 'src/domain/teaching/course-file/types/course-file.type';
import { Question } from 'src/domain/teaching/question/types/question.type';
import {
  PDF_EXTRACTOR,
  type IPdfExtractorProvider,
} from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import {
  OPENAI_REPOSITORY,
  type IOpenAiProvider,
} from 'src/domain/llm/openai/contracts/open-ai.provider';

import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import {
  QUESTIONS_REPOSITORY,
  type IQuestionsRepository,
} from 'src/domain/teaching/question/contracts/i-questions.repository';
import {
  GeneratedQuestion,
  QuestionGenerationConfig,
} from 'src/domain/llm/types/openai.type';

export type GenerateQuestionBody = {
  courseId: string;
  totalQuestions?: number;
  singleCount?: number;
  openedCount?: number;
};

export class GenerateQuestionUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(PDF_EXTRACTOR)
    private readonly pdfExtractor: IPdfExtractorProvider,
    @Inject(OPENAI_REPOSITORY)
    private readonly openaiRepository: IOpenAiProvider,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionRepository: IQuestionsRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(
    body: GenerateQuestionBody,
    user: AuthUser,
  ): Promise<Question[]> {
    const { courseId } = body;

    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id ${user.id} not found`);
    }

    const select = '*, sessions:sessions!inner(language, teacher_id)';

    const courseWithSession =
      await this.courseRepository.getCourseWithSessionById(courseId, select);

    if (courseWithSession.session.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to modify this course');
    }

    const language = courseWithSession.session.language || 'francais';
    const courseFiles =
      await this.courseFileRepository.getCourseFilesByCourseId(courseId);

    const contentText = courseWithSession.contentText || '';
    const combinedText = await this.getCombinedText(contentText, courseFiles);

    const config: QuestionGenerationConfig = {
      totalQuestions: body.totalQuestions,
      singleCount: body.singleCount,
      openedCount: body.openedCount,
      language,
    };

    const questions = await this.openaiRepository.generateQuestions(
      combinedText,
      config,
    );
    if (!questions || questions.length === 0) {
      throw new BadRequestError('Failed to generate questions');
    }

    await this.questionRepository.deleteCourseQuizQuestions(courseId);

    const multipleQuestions = questions.filter((q) => q.type === 'single');
    const openQuestions = questions.filter((q) => q.type === 'open');

    const alternatedQuestions: GeneratedQuestion[] = [];
    const maxLength = Math.max(multipleQuestions.length, openQuestions.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < multipleQuestions.length)
        alternatedQuestions.push(multipleQuestions[i]);
      if (i < openQuestions.length) alternatedQuestions.push(openQuestions[i]);
    }

    const insertedQuestions = await this.questionRepository.insertQuestions(
      alternatedQuestions,
      courseId,
    );
    return insertedQuestions;
  }

  private async getCombinedText(
    contentText: string,
    files: CourseFile[],
  ): Promise<string> {
    let combinedText = contentText;
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const buffer =
            await this.courseFileRepository.getFileBufferFromStorage(
              file.fileUrl,
            );
          const pdfText = await this.pdfExtractor.extractTextFromPdf(buffer);
          if (pdfText) {
            combinedText +=
              '\n\n--- Contenu du fichier: ' +
              file.fileName +
              ' ---\n\n' +
              pdfText;
          }
        } catch (error) {
          console.error('Error processing PDF:', error);
          continue;
        }
      }
    }

    if (!combinedText.trim()) {
      console.error(
        'No content available for this course. Add text or a PDF file:',
        files,
      );
      throw new BadRequestError(
        'No content available for this course. Add text or a PDF file.',
      );
    }
    return combinedText;
  }
}
