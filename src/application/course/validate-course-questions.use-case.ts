import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interface/questions.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import { Course } from 'src/domain/teaching/types/course.type';

export class ValidateCourseQuestionsUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<Course> {
    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const select = `
      id,
      session:sessions!inner (
        teacher_id
      )
    `;
    const course = await this.courseRepository.getCourseWithSessionById(
      courseId,
      select,
    );
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.session.teacherId !== teacher.id) {
      throw new UnauthorizedError(
        'You are not allowed to validate questions for this course',
      );
    }

    const questions =
      await this.questionsRepository.getCourseQuestions(courseId);
    if (!questions || questions.length === 0) {
      throw new BadRequestError(
        'You have to generate as less one question before validating them',
      );
    }
    const updatedCourse = await this.courseRepository.updateCourse(courseId, {
      validatedQuestions: true,
    });
    return updatedCourse;
  }
}
