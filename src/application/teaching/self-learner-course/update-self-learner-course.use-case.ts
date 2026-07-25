import { Inject } from '@nestjs/common';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import { SelfLearnerCourse } from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';
import {
  type ISelfLearnerRepository,
  SELF_LEARNER_REPOSITORY,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';

export type UpdateSelfLearnerCourseBody = {
  title?: string;
  description?: string;
  contentText?: string;
};

export class UpdateSelfLearnerCourseUseCase {
  constructor(
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
  ) {}

  async execute(userId: string, courseId: string, body: UpdateSelfLearnerCourseBody): Promise<SelfLearnerCourse> {
    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(userId);
    if (!selfLearner) {
      throw new NotFoundError('Self learner not found');
    }

    const selfLearnerCourse = await this.selfLearnerCourseRepository.getSelfLearnerCourseById(courseId);
    if (!selfLearnerCourse) {
      throw new NotFoundError('Self learner course not found');
    }

    if (selfLearnerCourse.selfLearnerId !== selfLearner.id) {
      throw new ForbiddenError('You are not authorized to update this course');
    }

    return this.selfLearnerCourseRepository.updateSelfLearnerCourse(courseId, body);
  }
}
