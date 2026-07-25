import { Inject } from '@nestjs/common';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { CourseFileUpload } from 'src/domain/teaching/course-file/types/course-file.type';
import {
  SELF_LEARNER_COURSE_FILE_REPOSITORY,
  type ISelfLearnerCourseFileRepository,
} from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import { SelfLearnerCourseFile } from 'src/domain/teaching/self-learner-course-file/types/self-learner-course-file.type';

export class UploadSelfLearnerCourseFileUseCase {
  constructor(
    @Inject(SELF_LEARNER_COURSE_FILE_REPOSITORY)
    private readonly selfLearnerCourseFileRepository: ISelfLearnerCourseFileRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(courseId: string, file: CourseFileUpload): Promise<SelfLearnerCourseFile> {
    const parts = file.originalFileName.split('.');
    const ext = parts.length > 1 ? (parts.pop() ?? '').trim() || 'bin' : 'bin';
    const fileUrl = `self-learner/${courseId}/${Date.now()}.${ext}`;
    await this.courseFileRepository.storeCourseFile(file, fileUrl);

    const payload = {
      courseId,
      fileUrl,
      fileName: file.originalFileName,
    };
    return this.selfLearnerCourseFileRepository.uploadSelfLearnerCourseFile(payload);
  }
}
