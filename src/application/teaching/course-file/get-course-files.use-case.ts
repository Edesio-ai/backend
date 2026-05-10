import { Inject } from '@nestjs/common';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';

export class GetCourseFilesUseCase {
  constructor(
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(courseId: string): Promise<any> {
    return await this.courseFileRepository.getCourseFilesByCourseId(courseId);
  }
}
