import { Inject } from '@nestjs/common';
import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';
import { LLM_REPOSITORY } from 'src/domain/llm/contracts/I-llm.provider';
import { type Language } from 'src/domain/teaching/session/types/session.type';

export type GenerateCompletionFeedbackBody = {
  total: number;
  score: number;
  courseTitle: string;
  studentName?: string;
  language?: Language;
};

export class GenerateCompletionFeedbackUseCase {
  constructor(
    @Inject(LLM_REPOSITORY)
    private readonly mistralRepository: ILlmProvider,
  ) {}

  async execute(body: GenerateCompletionFeedbackBody): Promise<string> {
    return await this.mistralRepository.generateCompletionFeedback({
      ...body,
      language: body.language ?? 'francais',
    });
  }
}
