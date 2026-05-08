import { Controller, Get, Param } from '@nestjs/common';

import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { GetAnsweredQuestionCountUseCase } from 'src/application/question/get-answered-question-count.use-case';
import { CourseQuestion } from 'src/domain/teaching/types/course-question.type';
import { GetStudentCourseQuestionsUseCase } from 'src/application/student/get-student-course-questions.use-case';

@Controller('course-questions')
@Roles('teacher')
export class CourseQuestionsController {
  constructor(
    private readonly getPendingQuestionCountUseCase: GetPendingQuestionCountUseCase,
    private readonly getAnsweredQuestionsCountUseCase: GetAnsweredQuestionCountUseCase,
    private readonly getStudentCourseQuestionsUseCase: GetStudentCourseQuestionsUseCase,
  ) {}

  @Get('pending/:sessionId')
  async getPendingQuestionsCount(@Param('sessionId') sessionId: string) {
    const count = await this.getPendingQuestionCountUseCase.execute(sessionId);
    return { count: count ?? 0 };
  }

  @Get('answered')
  async getAnsweredQuestionsCount(
    @CurrentUser() user: AuthUser,
  ): Promise<{ answeredQuestionsCount: number }> {
    const answeredQuestionsCount =
      await this.getAnsweredQuestionsCountUseCase.execute(user);
    return { answeredQuestionsCount };
  }

  @Roles('student')
  @Get('course/:courseId')
  async getStudentCourseQuestions(
    @Param('courseId') courseId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<CourseQuestion[]> {
    const questions = await this.getStudentCourseQuestionsUseCase.execute(
      courseId,
      user,
    );
    return questions;
  }
}
