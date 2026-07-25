import { Inject } from '@nestjs/common';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';

export class GetCourseValidatedQuestionsUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(courseId: string): Promise<{ validatedQuestions: boolean }> {
    return await this.courseRepository.getCourseValidatedQuestions(courseId);
  }
}
