import { Inject } from '@nestjs/common';
import { OPENAI_REPOSITORY } from 'src/domain/llm/openai/contracts/open-ai.provider';
import { IOpenAiProvider } from 'src/infrastructure/llm/openai/openai.repository';

export type GenerateCompletionFeedbackBody = {
  total: number;
  score: number;
  courseTitle: string;
  studentName: string;
};

export class GenerateCompletionFeedbackUseCase {
  constructor(
    @Inject(OPENAI_REPOSITORY)
    private readonly openaiRepository: IOpenAiProvider,
  ) {}

  async execute(body: GenerateCompletionFeedbackBody): Promise<string> {
    return await this.openaiRepository.generateCompletionFeedback(body);
  }
}
