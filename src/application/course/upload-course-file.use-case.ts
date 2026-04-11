import { Inject } from '@nestjs/common';
import {
  CourseFile,
  CourseFileUpload,
} from 'src/domain/teaching/types/course.type';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';

export class UploadCourseFileUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(courseId: string, file: CourseFileUpload): Promise<CourseFile> {
    const ext = file.originalFileName.split('.').pop() ?? 'bin';
    const storagePath = `${courseId}/${Date.now()}.${ext}`;
    await this.courseRepository.storeCourseFile(courseId, file, storagePath);

    return this.courseRepository.insertCourseFile(courseId, file, storagePath);
  }
}
