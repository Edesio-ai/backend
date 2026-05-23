import { Inject, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import {
  type ISelfLearnerRepository,
  SELF_LEARNER_REPOSITORY,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';

export class GetSelfLearnerCoursesCountUseCase {
  constructor(
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
  ) {}

  async execute(user: AuthUser): Promise<{ count: number }> {
    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(
      user.id,
    );
    if (!selfLearner) {
      throw new NotFoundException('Self learner not found');
    }

    const count =
      await this.selfLearnerCourseRepository.getSelfLearnerCoursesCount(
        selfLearner.id,
      );
    return { count };
  }
}
