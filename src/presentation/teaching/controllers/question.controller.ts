import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { Question } from 'src/domain/teaching/types/question.type';
import { GetCourseQuestionsUseCase } from 'src/application/question/get-course-questions.use-case';
import { GlobalErrorFilter } from 'src/presentation/filters/shared.filter';
import { TeacherErrorFilter } from 'src/presentation/filters/teacher.filter';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { GenerateQuestionDto } from '../dto/question/generate-question.dto';
import { GenerateQuestionUseCase } from 'src/application/question/generate-question-use-case';
import { CreateQuestionDto } from '../dto/question/create-question.dto';
import { CreateQuestionUseCase } from 'src/application/question/create-question.use-case';
import { DeleteQuestionByIdUseCase } from 'src/application/question/delete-question-by-id.use-case';
import { UpdateQuestionDto } from '../dto/question/update-question.dto';
import { UpdateQuestionByIdUseCase } from 'src/application/question/update-question-by-id.use-case';
import { AuthErrorFilter } from 'src/presentation/filters/auth.filter';
import { EvaluateAnswerDto } from '../dto/question/evaluate-answer.dto';
import { EvaluateAnswerUseCase } from 'src/application/question/evaluate-answer.use-case';
import { EvaluateAnswerResponse } from 'src/domain/shared/llm/types/openai.type';
import { GetAnsweredQuestionCountUseCase } from 'src/application/question/get-answered-question-count.use-case';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('teacher')
@UseFilters(GlobalErrorFilter, TeacherErrorFilter)
@Controller('question')
export class QuestionController {
  constructor(
    private readonly getPendingQuestionCountUseCase: GetPendingQuestionCountUseCase,
    private readonly getCourseQuestionsUseCase: GetCourseQuestionsUseCase,
    private readonly generateQuestionUseCase: GenerateQuestionUseCase,
    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly deleteQuestionByIdUseCase: DeleteQuestionByIdUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionByIdUseCase,
    private readonly evaluateAnswerUseCase: EvaluateAnswerUseCase,
    private readonly getAnsweredQuestionsCountUseCase: GetAnsweredQuestionCountUseCase,
  ) {}

  @UseFilters(AuthErrorFilter)
  @Get('pending/:sessionId')
  async getPendingQuestionsCount(@Param('sessionId') sessionId: string) {
    const count = await this.getPendingQuestionCountUseCase.execute(sessionId);
    return { count: count ?? 0 };
  }

  @Get('course/:courseId')
  async getCourseQuestions(
    @Req() req: Request & { user: AuthUser },
    @Param('courseId') courseId: string,
  ): Promise<Question[]> {
    const { user } = req;
    return (await this.getCourseQuestionsUseCase.execute(courseId, user)) || [];
  }

  @Post()
  async createQuestion(
    @Body() body: CreateQuestionDto,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ data: Question }> {
    const { user } = req;
    const question = await this.createQuestionUseCase.execute(body, user);
    return { data: question };
  }

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

  @Delete(':questionId')
  async deleteQuestionById(
    @Param('questionId') questionId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ success: boolean }> {
    const { user } = req;
    const success = await this.deleteQuestionByIdUseCase.execute(
      questionId,
      user,
    );
    return { success };
  }

  @Patch(':courseId')
  async updateQuestionById(
    @Param('courseId') courseId: string,
    @Body() body: UpdateQuestionDto,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ question: Question }> {
    const { user } = req;
    const question = await this.updateQuestionUseCase.execute(
      courseId,
      body,
      user,
    );

    return { question };
  }

  @Post('evaluate-answer')
  async evaluateAnswer(
    @Body() body: EvaluateAnswerDto,
  ): Promise<EvaluateAnswerResponse> {
    return await this.evaluateAnswerUseCase.execute(body);
  }

  @Roles()
  @Get('answered')
  async getAnsweredQuestionsCount(
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ answeredQuestionsCount: number }> {
    const { user } = req;
    const answeredQuestionsCount =
      await this.getAnsweredQuestionsCountUseCase.execute(user);
    return { answeredQuestionsCount };
  }
}
