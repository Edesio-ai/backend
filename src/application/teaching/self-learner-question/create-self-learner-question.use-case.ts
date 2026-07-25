import { Inject } from '@nestjs/common';
import { QuestionType } from 'src/domain/teaching/question/types/question.type';
import {
  type ISelfLearnerQuestionRepository,
  SELF_LEARNER_QUESTION_REPOSITORY,
} from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  type ISelfLearnerRepository,
  SELF_LEARNER_REPOSITORY,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';

type CreateSelfLearnerQuestionBody = {
  type: QuestionType;
  questionText: string;
  proposals?: string[];
  correctAnswers: string[];
  explanation?: string;
};

export class CreateSelfLearnerQuestionUseCase {
  constructor(
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
    @Inject(SELF_LEARNER_QUESTION_REPOSITORY)
    private readonly selfLearnerQuestionRepository: ISelfLearnerQuestionRepository,
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
  ) {}

  async execute(courseId: string, body: CreateSelfLearnerQuestionBody, user: AuthUser): Promise<SelfLearnerQuestion> {
    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(user.id);
    if (!selfLearner) {
      throw new NotFoundError('Self learner not found');
    }

    const selfLearnerCourse = await this.selfLearnerCourseRepository.getSelfLearnerCourseById(courseId);
    if (!selfLearnerCourse) {
      throw new NotFoundError('Self learner course not found');
    }

    if (selfLearnerCourse.selfLearnerId !== selfLearner.id) {
      throw new ForbiddenError('You are not allowed to create a question for this course');
    }
    const payload = {
      courseId: selfLearnerCourse.id,
      type: body.type,
      questionText: body.questionText,
      explanation: body.explanation || '',
      correctAnswers: body.correctAnswers,
      proposals: body.proposals || [],
    };

    return await this.selfLearnerQuestionRepository.createSelfLearnerQuestion(payload);
  }
}
