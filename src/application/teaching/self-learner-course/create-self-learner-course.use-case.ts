import { Inject, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import {
  SelfLearnerCourse,
  SelfLearnerCourseInsertPayload,
} from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';
import {
  type ISelfLearnerRepository,
  SELF_LEARNER_REPOSITORY,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { Language } from 'src/domain/teaching/session/types/session.type';

export type CreateSelfLearnerCourseBody = {
  title: string;
  description?: string | null;
  contentText?: string | null;
  language: Language;
};

export class CreateSelfLearnerCourseUseCase {
  constructor(
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
  ) {}

  async execute(
    user: AuthUser,
    createSelfLearnerCourseBody: CreateSelfLearnerCourseBody,
  ): Promise<SelfLearnerCourse> {
    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(
      user.id,
    );
    if (!selfLearner) {
      throw new NotFoundException('Self learner not found');
    }

    const insertPayload: SelfLearnerCourseInsertPayload = {
      selfLearnerId: selfLearner.id,
      title: createSelfLearnerCourseBody.title,
      description: createSelfLearnerCourseBody.description ?? null,
      textContent: createSelfLearnerCourseBody.contentText ?? null,
      language: createSelfLearnerCourseBody.language,
    };

    return this.selfLearnerCourseRepository.createSelfLearnerCourse(
      insertPayload,
    );
  }
}
