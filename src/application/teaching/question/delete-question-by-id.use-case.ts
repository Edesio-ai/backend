import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class DeleteQuestionByIdUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: CourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teachersRepository: TeacherRepository,
  ) {}

  async execute(questionId: string, user: AuthUser): Promise<boolean> {
    if (!questionId) {
      throw new BadRequestError('Question ID is required');
    }
    const { courseId } =
      await this.questionsRepository.getQuestionById(questionId);

    const teacher = await this.teachersRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const select = `
      id,
      sessions:sessions!inner (
        teacher_id
      )
    `;
    const course = await this.coursesRepository.getCourseWithSessionById(
      courseId,
      select,
    );
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.session.teacherId !== teacher.id) {
      throw new UnauthorizedError(
        `You are not allowed to delete this question in this course, session teacher id: ${course.session.teacherId}, teacher id: ${teacher.id}`,
      );
    }

    await this.questionsRepository.deleteQuestionById(questionId);
    return true;
  }
}
