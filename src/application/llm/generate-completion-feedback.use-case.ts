import { Inject } from '@nestjs/common';
import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';
import { LLM_REPOSITORY } from 'src/domain/llm/contracts/I-llm.provider';

export type GenerateCompletionFeedbackBody = {
  total: number;
  score: number;
  courseTitle: string;
  studentName: string;
};

export class GenerateCompletionFeedbackUseCase {
  constructor(
    @Inject(LLM_REPOSITORY)
    private readonly mistralRepository: ILlmProvider,
  ) {}

  async execute(body: GenerateCompletionFeedbackBody): Promise<string> {
    return await this.mistralRepository.generateCompletionFeedback(body);
  }
}
