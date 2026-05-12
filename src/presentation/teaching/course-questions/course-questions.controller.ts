import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { GetPendingQuestionCountUseCase } from 'src/application/teaching/course-question/get-pending-question-count.use-case';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { GetAnsweredQuestionCountUseCase } from 'src/application/teaching/course-question/get-answered-question-count.use-case';
import { CourseQuestion } from 'src/domain/teaching/course-question/types/course-question.type';
import { GetStudentCourseQuestionsUseCase } from 'src/application/teaching/course-question/get-student-course-questions.use-case';
import { SendCourseQuestionBodyDto } from './dtos/send-course-question-body.dto';
import { SendCourseQuestionUseCase } from 'src/application/teaching/course-question/send-course-question.use-case';

@Controller('course-question')
@Roles('teacher')
export class CourseQuestionsController {
  constructor(
    private readonly getPendingQuestionCountUseCase: GetPendingQuestionCountUseCase,
    private readonly getAnsweredQuestionsCountUseCase: GetAnsweredQuestionCountUseCase,
    private readonly getStudentCourseQuestionsUseCase: GetStudentCourseQuestionsUseCase,
    private readonly sendCourseQuestionUseCase: SendCourseQuestionUseCase,
  ) {}

  @Get('pending/:sessionId')
  async getPendingQuestionsCount(@Param('sessionId') sessionId: string) {
    const count = await this.getPendingQuestionCountUseCase.execute(sessionId);
    return { count: count ?? 0 };
  }

  @Roles('student')
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
  async getCourseQuestionsByCourseId(
    @Param('courseId') courseId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<CourseQuestion[]> {
    const questions = await this.getStudentCourseQuestionsUseCase.execute(
      courseId,
      user,
    );
    return questions;
  }

  @Roles('student')
  @Post()
  async sendCourseQuestion(
    @CurrentUser() user: AuthUser,
    @Body() body: SendCourseQuestionBodyDto,
  ): Promise<CourseQuestion | null> {
    const courseQuestion = await this.sendCourseQuestionUseCase.execute(
      body,
      user,
    );
    return courseQuestion;
  }
}
