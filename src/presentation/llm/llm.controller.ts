import { Body, Controller, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { GlobalErrorFilter } from 'src/presentation/filters/global';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { GenerateCompletionFeedbackBodyDto } from './dtos/generate-completion-feedback-body.dto';
import { GenerateCompletionFeedbackUseCase } from 'src/application/llm/generate-completion-feedback.use-case';
import { GenerateQuestionDto } from 'src/presentation/llm/dtos/generate-question.dto';
import { Question } from 'src/domain/teaching/types/question.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { GenerateQuestionUseCase } from 'src/application/question/generate-question-use-case';
import { EvaluateAnswerResponse } from 'src/domain/shared/llm/types/openai.type';
import { EvaluateAnswerDto } from './dtos/evaluate-answer.dto';
import { EvaluateAnswerUseCase } from 'src/application/question/evaluate-answer.use-case';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('student')
@UseFilters(GlobalErrorFilter)
@Controller('llm')
export class LlmController {
  constructor(
    private readonly generateCompletionFeedbackUseCase: GenerateCompletionFeedbackUseCase,
    private readonly generateQuestionUseCase: GenerateQuestionUseCase,
    private readonly evaluateAnswerUseCase: EvaluateAnswerUseCase,
  ) {}

  @Post('completion-feedback')
  async generateCompletionFeedback(
    @Body() body: GenerateCompletionFeedbackBodyDto,
  ): Promise<{ feedback: string }> {
    const feedback = await this.generateCompletionFeedbackUseCase.execute(body);
    return { feedback };
  }

  @Post('generate-questions')
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
    @Roles('student', 'teacher')
    @Post('evaluate-answer')
    async evaluateAnswer(
      @Body() body: EvaluateAnswerDto,
    ): Promise<EvaluateAnswerResponse> {
      return await this.evaluateAnswerUseCase.execute(body);
    }
}
