import { Inject, Injectable } from '@nestjs/common';
import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';
import { LLM_REPOSITORY } from 'src/domain/llm/contracts/I-llm.provider';
import { EvaluateAnswerResponse } from 'src/domain/llm/types/openai.type';

export interface EvaluateAnswerBody {
  questionText: string;
  correctAnswer: string;
  answer: string;
  explanation: string;
}

@Injectable()
export class EvaluateAnswerUseCase {
  constructor(
    @Inject(LLM_REPOSITORY)
    private readonly mistralRepository: ILlmProvider,
  ) {}

  async execute(body: EvaluateAnswerBody): Promise<EvaluateAnswerResponse> {
    const normalizedCorrectAnswers = this.normalizeString(body.correctAnswer);
    const normalizedStudentAnswer = this.normalizeString(body.answer);

    if (normalizedCorrectAnswers === normalizedStudentAnswer) {
      return {
        score: 0,
        feedback: "Bien essayé ! Mais ce n'est pas en trichant que tu vas progresser.",
        concepts: [],
        missingElements: [],
        suggestedAction: null,
        actionPrompt: null,
        isCheating: true,
      };
    }

    return await this.mistralRepository.evaluateAnswer(body);
  }

  private normalizeString(string: string): string {
    return string
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }
}
