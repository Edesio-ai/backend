import { Inject } from '@nestjs/common';
import { OPENAI_REPOSITORY } from 'src/domain/shared/llm/openai/contracts/opena-ai.repository';
import { OpenaiRepository } from 'src/infrastructure/llm/openai/openai.repository';

export type GenerateCompletionFeedbackBody = {
  total: number;
  score: number;
  courseTitle: string;
  studentName: string;
};

export class GenerateCompletionFeedbackUseCase {
  constructor(
    @Inject(OPENAI_REPOSITORY)
    private readonly openaiRepository: OpenaiRepository,
  ) {}

  async execute(body: GenerateCompletionFeedbackBody): Promise<string> {
    return await this.openaiRepository.generateCompletionFeedback(body);
  }
}
