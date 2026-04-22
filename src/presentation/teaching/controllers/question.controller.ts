import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import {
  GeneratedQuestion,
  Question,
} from 'src/domain/teaching/types/question.type';
import { GetCourseQuestionsUseCase } from 'src/application/question/get-course-questions.use-case';
import { GlobalErrorFilter } from 'src/presentation/filters/shared.filter';
import { TeacherErrorFilter } from 'src/presentation/filters/teacher.filter';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { GenerateQuestionDto } from '../dto/question/generate-question.dto';
import { GenerateQuestionUseCase } from 'src/application/question/generate-question-use-case';
import { OpenAiErrorFilter } from 'src/presentation/filters/openai.filter';
import { CreateQuestionDto } from '../dto/question/create-question.dto';
import { CreateQuestionUseCase } from 'src/application/question/create-question.use-case';

@Controller('question')
export class QuestionController {
  constructor(
    private readonly getPendingQuestionCountUseCase: GetPendingQuestionCountUseCase,
    private readonly getCourseQuestionsUseCase: GetCourseQuestionsUseCase,
    private readonly generateQuestionUseCase: GenerateQuestionUseCase,
    private readonly createQuestionUseCase: CreateQuestionUseCase,
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

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @UseFilters(GlobalErrorFilter, TeacherErrorFilter)
  @Roles('teacher')
  @Post()
  async createQuestion(
    @Body() body: CreateQuestionDto,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ data: Question }> {
    const { user } = req;
    const question = await this.createQuestionUseCase.execute(body, user);
    return { data: question };
  }

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @UseFilters(OpenAiErrorFilter)
  @Roles('teacher')
  @Post('generate')
  async generateQuestion(
    @Req() req: Request & { user: AuthUser },
    @Body() body: GenerateQuestionDto,
  ): Promise<{ questions: Question[]; questionCount: number }> {
    const { user } = req;
    const questions = await this.generateQuestionUseCase.execute(body, user);
    return {
      questions,
      questionCount: questions.length,
    };
  }
}
