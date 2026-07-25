import { Inject } from '@nestjs/common';
import { CreateCourseBody, Course } from 'src/domain/teaching/course/types/course.type';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';

export class CreateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(body: CreateCourseBody): Promise<Course> {
    const course = await this.courseRepository.createCourse(body);
    return course;
  }
}
