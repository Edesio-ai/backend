import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_QUESTION_REPOSITORY,
  type ICourseQuestionRepository,
} from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { type ITeacherRepository, TEACHER_REPOSITORY } from 'src/domain/teaching/teacher/contracts/teacher.repository';

export class DeleteCourseQuestionUseCase {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly courseQuestionRepository: ICourseQuestionRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(courseQuestionId: string, user: AuthUser): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const courseQuestion = await this.courseQuestionRepository.getCourseQuestionByCourseId(courseQuestionId);
    if (!courseQuestion) {
      throw new NotFoundException('Course question not found');
    }

    const select = `
        id,
        sessions:sessions!inner (
            teacher_id
        )
        `;

    const CourseWithSession = await this.courseRepository.getCourseWithSessionById(courseQuestion.courseId, select);
    if (!CourseWithSession) {
      throw new NotFoundException('Course not found');
    }

    if (CourseWithSession.session.teacherId !== teacher.id) {
      throw new ForbiddenException('You are not allowed to delete this course question');
    }

    await this.courseQuestionRepository.deleteCourseQuestionById(courseQuestionId);
  }
}
