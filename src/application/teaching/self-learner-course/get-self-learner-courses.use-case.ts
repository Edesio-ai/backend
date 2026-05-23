import { Inject, NotFoundException } from '@nestjs/common';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ISELF_LEARNER_REPOSITORY,
  type ISelfLearnerRepository,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { SelfLearnerCourse } from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';

export class GetSelfLearnerCoursesUseCase {
  constructor(
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
    @Inject(ISELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
  ) {}

  async execute(user: AuthUser): Promise<SelfLearnerCourse[]> {
    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(
      user.id,
    );
    if (!selfLearner) {
      console.error(`Self learner not found for user ${user.id}`);
      throw new NotFoundException('Self learner not found');
    }

    return await this.selfLearnerCourseRepository.getSelfLearnerCourses(
      selfLearner.id,
    );
  }
}
