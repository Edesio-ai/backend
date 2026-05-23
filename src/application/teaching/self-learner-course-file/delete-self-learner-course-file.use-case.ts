import { Inject } from '@nestjs/common';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import {
  type ICourseFileRepository,
  COURSE_FILE_REPOSITORY,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
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

export class DeleteSelfLearnerCourseFileUseCase {
  constructor(
    @Inject(SELF_LEARNER_COURSE_FILE_REPOSITORY)
    private readonly selfLearnerCourseFileRepository: ISelfLearnerCourseFileRepository,
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  public async execute(userId: string, fileId: string): Promise<void> {
    const selfLearner =
      await this.selfLearnerRepository.getSelfLearnerByUserId(userId);
    if (!selfLearner) {
      throw new NotFoundError('Self learner course file not found');
    }

    const selfLearnerCourseFile =
      await this.selfLearnerCourseFileRepository.getSelfLearnerCourseFileById(
        fileId,
      );
    if (!selfLearnerCourseFile) {
      throw new NotFoundError('Self learner course file not found');
    }

    const course =
      await this.selfLearnerCourseRepository.getSelfLearnerCourseById(
        selfLearnerCourseFile.courseId,
      );
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.selfLearnerId !== selfLearner.id) {
      throw new ForbiddenError(
        'You are not allowed to delete this course file',
      );
    }

    await this.courseFileRepository.deleteFileFromStorage(
      selfLearnerCourseFile.fileUrl,
    );
    await this.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFileById(
      fileId,
    );
  }
}
