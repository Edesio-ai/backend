import { Inject } from '@nestjs/common';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';

export class GetCoursesSessionCountUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(sessionId: string): Promise<number> {
    return await this.courseRepository.getSessionCoursesCount(sessionId);
  }
}
