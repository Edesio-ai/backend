import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';

export class GetCoursesSessionCountUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(sessionId: string): Promise<number> {
    return await this.courseRepository.getSessionCoursesCount(sessionId);
  }
}
