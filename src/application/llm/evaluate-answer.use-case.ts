import { Inject, Injectable } from '@nestjs/common';
import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';
import { LLM_REPOSITORY } from 'src/domain/llm/contracts/I-llm.provider';
import { EvaluateAnswerResponse } from 'src/domain/llm/types/openai.type';
import { type Language } from 'src/domain/teaching/session/types/session.type';

const CHEATING_FEEDBACK: Record<Language, string> = {
  francais: "Bien essayé ! Mais ce n'est pas en trichant que tu vas progresser.",
  anglais: "Nice try! But cheating won't help you improve.",
  espagnol: '¡Buen intento! Pero no progresarás haciendo trampa.',
  allemand: 'Netter Versuch! Aber durch Schummeln wirst du nicht besser.',
};

export interface EvaluateAnswerBody {
  questionText: string;
  correctAnswer: string;
  answer: string;
  explanation: string;
  language?: Language;
  cheatingDetectionEnabled?: boolean;
}

@Injectable()
export class EvaluateAnswerUseCase {
  constructor(
    @Inject(LLM_REPOSITORY)
    private readonly mistralRepository: ILlmProvider,
  ) {}

  async execute(body: EvaluateAnswerBody): Promise<EvaluateAnswerResponse> {
    const cheatingDetectionEnabled = body.cheatingDetectionEnabled !== false;
    const normalizedCorrectAnswers = this.normalizeString(body.correctAnswer);
    const normalizedStudentAnswer = this.normalizeString(body.answer);

    if (cheatingDetectionEnabled && normalizedCorrectAnswers === normalizedStudentAnswer) {
      const language = body.language ?? 'francais';
      return {
        score: 0,
        feedback: CHEATING_FEEDBACK[language],
        concepts: [],
        missingElements: [],
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
