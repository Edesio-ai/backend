import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import {
  type ISelfLearnerQuestionRepository,
  SELF_LEARNER_QUESTION_REPOSITORY,
} from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import {
  type ISelfLearnerRepository,
  SELF_LEARNER_REPOSITORY,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';

export class DeleteSelfLearnerQuestionUseCase {
  constructor(
    @Inject(SELF_LEARNER_QUESTION_REPOSITORY)
    private readonly selfLearnerQuestionRepository: ISelfLearnerQuestionRepository,
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
  ) {}

  async execute(user: AuthUser, questionId: string): Promise<void> {
    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(user.id);
    if (!selfLearner) {
      throw new NotFoundError('Self learner not found');
    }
    const selfLearnerQuestion = await this.selfLearnerQuestionRepository.getSelfLearnerQuestionById(questionId);
    if (!selfLearnerQuestion) {
      throw new NotFoundError('Self learner question not found');
    }
    const selfLearnerCourse = await this.selfLearnerCourseRepository.getSelfLearnerCourseById(
      selfLearnerQuestion.courseId,
    );
    if (!selfLearnerCourse) {
      throw new NotFoundError('Self learner course not found');
    }

    if (selfLearnerCourse.selfLearnerId !== selfLearner.id) {
      throw new ForbiddenError('You are not allowed to delete this self learner question');
    }
    await this.selfLearnerQuestionRepository.deleteSelfLearnerQuestionById(questionId);
  }
}
