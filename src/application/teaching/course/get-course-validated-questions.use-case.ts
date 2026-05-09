import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';

export class GetCourseValidatedQuestionsUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(courseId: string): Promise<{ validatedQuestions: boolean }> {
    return await this.courseRepository.getCourseValidatedQuestions(courseId);
  }
}
