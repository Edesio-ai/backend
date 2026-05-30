import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { QuestionType } from 'src/domain/teaching/question/types/question.type';
import {
  SelfLearnerQuestion,
  SelfLearnerQuestionInsert,
} from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import {
  type ISelfLearnerRepository,
  SELF_LEARNER_REPOSITORY,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import {
  BadRequestError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from 'src/domain/shared/errors/global.errors';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import {
  type ISelfLearnerCourseFileRepository,
  SELF_LEARNER_COURSE_FILE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import { SelfLearnerCourseFile } from 'src/domain/teaching/self-learner-course-file/types/self-learner-course-file.type';
import { SelfLearnerCourse } from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';
import {
  type ICourseFileRepository,
  COURSE_FILE_REPOSITORY,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import {
  type IPdfExtractorProvider,
  PDF_EXTRACTOR,
} from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import {
  type ISelfLearnerQuestionRepository,
  SELF_LEARNER_QUESTION_REPOSITORY,
} from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import { QuestionGenerationConfig } from 'src/domain/llm/types/openai.type';
import {
  type IOpenAiProvider,
  OPENAI_REPOSITORY,
} from 'src/domain/llm/openai/contracts/open-ai.provider';

export class GenerateSelfLearnerQuestionUseCase {
  constructor(
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
    @Inject(SELF_LEARNER_COURSE_FILE_REPOSITORY)
    private readonly selfLearnerCourseFileRepository: ISelfLearnerCourseFileRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(PDF_EXTRACTOR)
    private readonly pdfExtractor: IPdfExtractorProvider,
    @Inject(SELF_LEARNER_QUESTION_REPOSITORY)
    private readonly selfLearnerQuestionRepository: ISelfLearnerQuestionRepository,
    @Inject(OPENAI_REPOSITORY)
    private readonly openaiRepository: IOpenAiProvider,
  ) {}

  async execute(
    user: AuthUser,
    type: QuestionType,
    selfLearnerCourseId: string,
  ): Promise<SelfLearnerQuestion> {
    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(
      user.id,
    );
    if (!selfLearner) {
      throw new NotFoundError('Self learner not found');
    }

    const selfLearnerCourse =
      await this.selfLearnerCourseRepository.getSelfLearnerCourseById(
        selfLearnerCourseId,
      );
    if (!selfLearnerCourse) {
      throw new NotFoundError('Self learner course not found');
    }

    if (selfLearnerCourse.selfLearnerId !== selfLearner.id) {
      throw new UnauthorizedError(
        'You are not authorized to generate a self learner question for this course',
      );
    }

    const language = selfLearnerCourse.language;

    const selfLearnerCourseFiles =
      await this.selfLearnerCourseFileRepository.getSelfLearnerCourseFiles(
        selfLearnerCourseId,
      );

    const combinedText = await this.getCombinedText(
      selfLearnerCourse,
      selfLearnerCourseFiles,
    );
    if (!combinedText.trim()) {
      throw new BadRequestError('No content available for this course');
    }

    const selfLearnerQuestion =
      await this.selfLearnerQuestionRepository.getSelfLearnerQuestions(
        selfLearnerCourseId,
      );
    const existingQuestionTexts =
      selfLearnerQuestion?.map((q) => q.questionText) || [];

    const questionConfig: QuestionGenerationConfig = {
      totalQuestions: 1,
      singleCount: type === 'single' ? 1 : 0,
      openedCount: type === 'open' ? 1 : 0,
      language: language,
    };

    const generatedQuestion = await this.openaiRepository.generateQuestions(
      combinedText,
      questionConfig,
      existingQuestionTexts,
    );
    if (!generatedQuestion || generatedQuestion.length === 0) {
      throw new ServerError('An error occurred while generating the question');
    }

    const newQuestion = generatedQuestion[0];
    const payload: SelfLearnerQuestionInsert = {
      ...newQuestion,
      courseId: selfLearnerCourseId,
      type: type,
    };

    const newSelfLearnerQuestion =
      await this.selfLearnerQuestionRepository.createSelfLearnerQuestion(
        payload,
      );

    return newSelfLearnerQuestion;
  }

  private async getCombinedText(
    selfLearnerCourse: SelfLearnerCourse,
    selfLearnerCourseFiles: SelfLearnerCourseFile[],
  ): Promise<string> {
    let combinedText = selfLearnerCourse.textContent || '';
    for (const file of selfLearnerCourseFiles) {
      try {
        const buffer = await this.courseFileRepository.getFileBufferFromStorage(
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
    return combinedText;
  }
}
