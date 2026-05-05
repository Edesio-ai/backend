import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { GlobalErrorFilter } from 'src/presentation/filters/shared.filter';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { GenerateCompletionFeedbackBodyDto } from '../dtos/generate-completion-feedback-body.dto';
import { GenerateCompletionFeedbackUseCase } from 'src/application/llm/generate-completion-feedback.use-case';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('student')
@UseFilters(GlobalErrorFilter)
@Controller('llm')
export class LlmController {
  constructor(
    private readonly generateCompletionFeedbackUseCase: GenerateCompletionFeedbackUseCase,
  ) {}

  @Post('completion-feedback')
  async generateCompletionFeedback(
    @Body() body: GenerateCompletionFeedbackBodyDto,
  ): Promise<{ feedback: string }> {
    const feedback = await this.generateCompletionFeedbackUseCase.execute(body);
    return { feedback };
  }
}
