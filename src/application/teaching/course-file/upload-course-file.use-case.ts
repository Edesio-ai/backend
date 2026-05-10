import { Inject } from '@nestjs/common';
import {
  CourseFileUpload,
  CourseFile,
} from 'src/domain/teaching/course/types/course.type';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';

export class UploadCourseFileUseCase {
  constructor(
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(courseId: string, file: CourseFileUpload): Promise<CourseFile> {
    const ext = file.originalFileName.split('.').pop() ?? 'bin';
    const storagePath = `${courseId}/${Date.now()}.${ext}`;
    await this.courseFileRepository.storeCourseFile(file, storagePath);

    return this.courseFileRepository.insertCourseFile(
      courseId,
      file,
      storagePath,
    );
  }
}
