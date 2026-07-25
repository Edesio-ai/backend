import { Inject } from '@nestjs/common';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  type ISelfLearnerCourseFileRepository,
  SELF_LEARNER_COURSE_FILE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import {
  type ISelfLearnerCourseRepository,
  SELF_LEARNER_COURSE_REPOSITORY,
} from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import {
  type ISelfLearnerRepository,
  SELF_LEARNER_REPOSITORY,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';

export class GetSelfLearnerCourseFileSignedUrlUseCase {
  constructor(
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
    @Inject(SELF_LEARNER_COURSE_FILE_REPOSITORY)
    private readonly selfLearnerCourseFileRepository: ISelfLearnerCourseFileRepository,
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
  ) {}

  public async execute(userId: string, fileId: string): Promise<string | null> {
    const selfLearner = await this.selfLearnerRepository.getSelfLearnerByUserId(userId);
    if (!selfLearner) {
      throw new NotFoundError('Self learner not found');
    }

    const selfLearnerCourseFile = await this.selfLearnerCourseFileRepository.getSelfLearnerCourseFileById(fileId);
    if (!selfLearnerCourseFile) {
      throw new NotFoundError('Self learner course file not found');
    }

    const selfLearnerCourse = await this.selfLearnerCourseRepository.getSelfLearnerCourseById(
      selfLearnerCourseFile.courseId,
    );
    if (!selfLearnerCourse) {
      throw new NotFoundError('Self learner course not found');
    }

    if (selfLearnerCourse.selfLearnerId !== selfLearner.id) {
      throw new ForbiddenError('You are not allowed to get the signed url for this course file');
    }

    return await this.selfLearnerCourseFileRepository.getSelfLearnerCourseFileSignedUrl(selfLearnerCourseFile.fileUrl);
  }
}
