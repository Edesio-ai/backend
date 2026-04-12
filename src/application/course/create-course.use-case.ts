import { Inject } from '@nestjs/common';
import {
  SupabaseCourse,
  CreateCourseBody,
  Course,
} from 'src/domain/teaching/types/course.type';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';

export class CreateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(body: CreateCourseBody): Promise<Course> {
    const course = await this.courseRepository.createCourse(body);
    return course;
  }
}
