import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';

export class GetCourseFilesUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(courseId: string): Promise<any> {
    return await this.courseRepository.getCourseFilesByCourseId(courseId);
  }
}
