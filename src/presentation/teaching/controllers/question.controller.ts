import { Controller, Get, Param } from '@nestjs/common';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';

@Controller('question')
export class QuestionController {
  constructor(
    private readonly getPendingQuestionCountUseCase: GetPendingQuestionCountUseCase,
  ) {}

  @Get('pending/:sessionId')
  async getPendingQuestionsCount(@Param('sessionId') sessionId: string) {
    const count = await this.getPendingQuestionCountUseCase.execute(sessionId);
    return { count: count ?? 0 };
  }
}
