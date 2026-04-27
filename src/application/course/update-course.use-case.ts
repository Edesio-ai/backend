import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import { Course } from 'src/domain/teaching/types/course.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  NotFoundError,
  UnauthorizedError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';

export type UpdateCourseBody = {
  title?: string | null;
  description?: string | null;
  contentText?: string | null;
};
export class UpdateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
  ) {}

  async execute(
    courseId: string,
    body: UpdateCourseBody,
    user: AuthUser,
  ): Promise<Course> {
    const course = await this.courseRepository.getCourseWithSessionById(
      courseId,
      'id, session:sessions!inner(teacher_id)',
    );
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }
    if (course.session.teacherId !== teacher.id) {
      throw new UnauthorizedError('You are not allowed to update this course');
    }

    const updatedCourse = await this.courseRepository.updateCourse(
      courseId,
      body,
    );
    return updatedCourse;
  }
}
