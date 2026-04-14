import {
  Controller,
  Get,
  Param,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { Question } from 'src/domain/teaching/types/question.type';
import { GetCourseQuestionsUseCase } from 'src/application/question/get-course-questions.use-case';
import { GlobalErrorFilter } from 'src/presentation/filters/shared.filter';
import { TeacherErrorFilter } from 'src/presentation/filters/teacher.filter';

@Controller('question')
export class QuestionController {
  constructor(
    private readonly getPendingQuestionCountUseCase: GetPendingQuestionCountUseCase,
    private readonly getCourseQuestionsUseCase: GetCourseQuestionsUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('pending/:sessionId')
  async getPendingQuestionsCount(@Param('sessionId') sessionId: string) {
    const count = await this.getPendingQuestionCountUseCase.execute(sessionId);
    return { count: count ?? 0 };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(GlobalErrorFilter, TeacherErrorFilter)
  @Roles('teacher')
  @Get('course/:courseId')
  async getCourseQuestions(
    @Req() req: Request & { user: AuthUser },
    @Param('courseId') courseId: string,
  ): Promise<Question[]> {
    const { user } = req;
    return (await this.getCourseQuestionsUseCase.execute(courseId, user)) || [];
  }
}
