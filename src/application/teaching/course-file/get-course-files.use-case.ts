import { Inject } from '@nestjs/common';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { CourseFile } from 'src/domain/teaching/course-file/types/course-file.type';

export class GetCourseFilesUseCase {
  constructor(
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(courseId: string): Promise<CourseFile[]> {
    return await this.courseFileRepository.getCourseFilesByCourseId(courseId);
  }
}
