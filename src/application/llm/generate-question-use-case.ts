import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { CourseFile } from 'src/domain/teaching/course-file/types/course-file.type';
import { Question } from 'src/domain/teaching/question/types/question.type';
import { PDF_EXTRACTOR, type IPdfExtractorProvider } from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import { LLM_REPOSITORY, type ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';

import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { ForbiddenError, BadRequestError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import {
  QUESTIONS_REPOSITORY,
  type IQuestionsRepository,
} from 'src/domain/teaching/question/contracts/i-questions.repository';
import { GeneratedQuestion, QuestionGenerationConfig } from 'src/domain/llm/types/openai.type';
import {
  SELF_LEARNER_REPOSITORY,
  type ISelfLearnerRepository,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import {
  type ISelfLearnerCourseFileRepository,
  SELF_LEARNER_COURSE_FILE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import {
  type ISelfLearnerQuestionRepository,
  SELF_LEARNER_QUESTION_REPOSITORY,
} from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';

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
    @Inject(LLM_REPOSITORY)
    private readonly mistralRepository: ILlmProvider,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionRepository: IQuestionsRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
    @Inject(SELF_LEARNER_COURSE_FILE_REPOSITORY)
    private readonly selfLearnerCourseFileRepository: ISelfLearnerCourseFileRepository,
    @Inject(SELF_LEARNER_QUESTION_REPOSITORY)
    private readonly selfLearnerQuestionRepository: ISelfLearnerQuestionRepository,
  ) {}

  async execute(body: GenerateQuestionBody, user: AuthUser): Promise<Question[] | SelfLearnerQuestion[]> {
    const { courseId } = body;
    const role = user.metadata.role;

    const { combinedText, config } =
      role === 'teacher'
        ? await this.getTeacherGenerationConfig(user.id, body)
        : await this.getSelfLearnerGenerationConfig(user.id, body);

    const questions = await this.mistralRepository.generateQuestions(combinedText, config);
    if (!questions || questions.length === 0) {
      throw new BadRequestError('Failed to generate questions');
    }

    if (role === 'teacher') {
      await this.questionRepository.deleteCourseQuizQuestions(courseId);
    } else {
      await this.selfLearnerQuestionRepository.deleteSelfLearnerQuestionsByCourseId(courseId);
    }

    const multipleQuestions = questions.filter((q) => q.type === 'single');
    const openQuestions = questions.filter((q) => q.type === 'open');

    const alternatedQuestions: GeneratedQuestion[] = [];
    const maxLength = Math.max(multipleQuestions.length, openQuestions.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < multipleQuestions.length) alternatedQuestions.push(multipleQuestions[i]);
      if (i < openQuestions.length) alternatedQuestions.push(openQuestions[i]);
    }

    const insertedQuestions =
      role === 'teacher'
        ? await this.questionRepository.insertQuestions(alternatedQuestions, courseId)
        : await this.selfLearnerQuestionRepository.insertSelfLearnerQuestions(alternatedQuestions, courseId);

    return insertedQuestions;
  }

  private async getTeacherGenerationConfig(
    userId: string,
    body: GenerateQuestionBody,
  ): Promise<{ combinedText: string; config: QuestionGenerationConfig }> {
    const { courseId, totalQuestions, singleCount, openedCount } = body;
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id ${userId} not found`);
    }

    const select = '*, sessions:sessions!inner(language, teacher_id)';

    const courseWithSession = await this.courseRepository.getCourseWithSessionById(courseId, select);

    if (!courseWithSession) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }

    if (courseWithSession.session.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to modify this course');
    }

    const language = courseWithSession.session.language || 'francais';
    const courseFiles = await this.courseFileRepository.getCourseFilesByCourseId(courseId);

    const contentText = courseWithSession.contentText || '';
    const combinedText = await this.getCombinedText(contentText, courseFiles);
    return {
      combinedText,
      config: {
        totalQuestions,
        singleCount,
        openedCount,
        language,
      },
    };
  }
  private async getSelfLearnerGenerationConfig(
    userId: string,
    body: GenerateQuestionBody,
  ): Promise<{ combinedText: string; config: QuestionGenerationConfig }> {
    const { courseId, totalQuestions, singleCount, openedCount } = body;

    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(userId);
    if (!selfLearner) {
      throw new NotFoundError(`Self learner with id ${userId} not found`);
    }

    const selfLearnerCourse = await this.selfLearnerCourseRepository.getSelfLearnerCourseById(courseId);
    if (!selfLearnerCourse) {
      throw new NotFoundError(`Self learner course with id ${courseId} not found`);
    }

    if (selfLearnerCourse.selfLearnerId !== selfLearner.id) {
      throw new ForbiddenError('You are not authorized to modify this course');
    }

    const language = selfLearnerCourse.language || 'francais';
    const courseFiles = await this.selfLearnerCourseFileRepository.getSelfLearnerCourseFiles(courseId);
    const contentText = selfLearnerCourse.textContent || '';
    const combinedText = await this.getCombinedText(contentText, courseFiles);

    return {
      combinedText,
      config: {
        totalQuestions,
        singleCount,
        openedCount,
        language,
      },
    };
  }

  private async getCombinedText(contentText: string, files: CourseFile[]): Promise<string> {
    let combinedText = contentText;
    if (files && files.length > 0) {
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
          console.error('Error processing PDF:', error);
          continue;
        }
      }
    }

    if (!combinedText.trim()) {
      console.error('No content available for this course. Add text or a PDF file:', files);
      throw new BadRequestError('No content available for this course. Add text or a PDF file.');
    }
    return combinedText;
  }
}
