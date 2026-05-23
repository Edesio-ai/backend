import { Inject } from '@nestjs/common';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
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
import {
  type ICourseFileRepository,
  COURSE_FILE_REPOSITORY,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import {
  type ISelfLearnerQuestionRepository,
  SELF_LEARNER_QUESTION_REPOSITORY,
} from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';

export class DeleteSelfLearnerCourseUseCase {
  constructor(
    @Inject(SELF_LEARNER_COURSE_REPOSITORY)
    private readonly selfLearnerCourseRepository: ISelfLearnerCourseRepository,
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
    @Inject(SELF_LEARNER_COURSE_FILE_REPOSITORY)
    private readonly selfLearnerCourseFileRepository: ISelfLearnerCourseFileRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(SELF_LEARNER_QUESTION_REPOSITORY)
    private readonly selfLearnerQuestionRepository: ISelfLearnerQuestionRepository,
  ) {}

  async execute(userId: string, courseId: string): Promise<void> {
    const selfLearner =
      await this.selfLearnerRepository.getSelfLearnerByUserId(userId);
    if (!selfLearner) {
      throw new NotFoundError('Self learner not found');
    }

    const selfLearnerCourse =
      await this.selfLearnerCourseRepository.getSelfLearnerCourseById(courseId);
    if (!selfLearnerCourse) {
      throw new NotFoundError('Self learner course not found');
    }

    if (selfLearnerCourse.selfLearnerId !== selfLearner.id) {
      throw new ForbiddenError('You are not authorized to delete this course');
    }

    const courseFilesUrls =
      await this.selfLearnerCourseFileRepository.getSelfLearnerCourseFilesUrls(
        courseId,
      );
    if (courseFilesUrls.length > 0) {
      for (const fileUrl of courseFilesUrls) {
        await this.courseFileRepository.deleteFileFromStorage(fileUrl);
      }
    }

    await this.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFilesByCourseId(
      courseId,
    );
    await this.selfLearnerQuestionRepository.deleteSelfLearnerQuestionsByCourseId(
      courseId,
    );
    await this.selfLearnerCourseRepository.deleteSelfLearnerCourse(courseId);
  }
}
