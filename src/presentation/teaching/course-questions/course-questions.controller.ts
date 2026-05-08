import {
  Controller,
  Get,
  Param,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { GlobalErrorFilter } from 'src/presentation/filters/global';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';
import { AuthErrorFilter } from 'src/presentation/filters/auth.filter';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { GetAnsweredQuestionCountUseCase } from 'src/application/question/get-answered-question-count.use-case';
import { CourseQuestion } from 'src/domain/teaching/types/course-question.type';
import { GetStudentCourseQuestionsUseCase } from 'src/application/student/get-student-course-questions.use-case';

@Controller('course-questions')
@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('teacher')
@UseFilters(GlobalErrorFilter, AuthErrorFilter)
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
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ answeredQuestionsCount: number }> {
    const { user } = req;
    const answeredQuestionsCount =
      await this.getAnsweredQuestionsCountUseCase.execute(user);
    return { answeredQuestionsCount };
  }

  @Roles('student')
  @Get('course/:courseId')
  async getStudentCourseQuestions(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<CourseQuestion[]> {
    const { user } = req;
    const questions = await this.getStudentCourseQuestionsUseCase.execute(
      courseId,
      user,
    );
    return questions;
  }
}
