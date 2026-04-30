import { Inject, Injectable } from '@nestjs/common';
import { OPENAI_REPOSITORY } from 'src/domain/shared/llm/openai/contracts/opena-ai.repository';
import { OpenaiRepository } from 'src/infrastructure/llm/openai/openai.repository';
import { EvaluateAnswerResponse } from 'src/domain/shared/llm/types/openai.type';

export interface EvaluateAnswerBody {
  questionText: string;
  correctAnswer: string;
  answer: string;
  explanation: string;
}

@Injectable()
export class EvaluateAnswerUseCase {
  constructor(
    @Inject(OPENAI_REPOSITORY)
    private readonly openaiRepository: OpenaiRepository,
  ) {}

  async execute(body: EvaluateAnswerBody): Promise<EvaluateAnswerResponse> {
    const normalizedCorrectAnswers = this.normalizeString(body.correctAnswer);
    const normalizedStudentAnswer = this.normalizeString(body.answer);

    if (normalizedCorrectAnswers === normalizedStudentAnswer) {
      return {
        score: 1,
        feedback: "Parfait ! C'est exactement la bonne réponse.",
        concepts: [],
        missingElements: [],
        suggestedAction: null,
        actionPrompt: null,
      };
    }

    return await this.openaiRepository.evaluateAnswer(body);
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
