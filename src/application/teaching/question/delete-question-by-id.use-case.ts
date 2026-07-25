import { Inject, Injectable } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  QUESTIONS_REPOSITORY,
  type IQuestionsRepository,
} from 'src/domain/teaching/question/contracts/i-questions.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';

@Injectable()
export class DeleteQuestionByIdUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: ICourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teachersRepository: ITeacherRepository,
  ) {}

  async execute(questionId: string, user: AuthUser): Promise<boolean> {
    if (!questionId) {
      throw new BadRequestError('Question ID is required');
    }
    const question = await this.questionsRepository.getQuestionById(questionId);
    if (!question) {
      throw new NotFoundError('Question not found');
    }
    const { courseId } = question;

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
    const course = await this.coursesRepository.getCourseWithSessionById(courseId, select);
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
