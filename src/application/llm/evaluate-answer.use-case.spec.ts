import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';
import { EvaluateAnswerUseCase, EvaluateAnswerBody } from './evaluate-answer.use-case';
import { EvaluateAnswerResponse } from 'src/domain/llm/types/openai.type';

describe('EvaluateAnswerUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('when answers are identical after normalization', () => {
    it('should detect cheating and return score 0 without calling OpenAI', async () => {
      const result = await fixtures.whenExecute({
        ...fixtures.body,
        answer: fixtures.body.correctAnswer,
      });

      expect(result.score).toBe(0);
      expect(result.isCheating).toBe(true);
      expect(result.feedback).toBe("Bien essayé ! Mais ce n'est pas en trichant que tu vas progresser.");
      expect(result.concepts).toEqual([]);
      expect(result.missingElements).toEqual([]);
      expect(result.suggestedAction).toBeNull();
      expect(result.actionPrompt).toBeNull();
      expect(fixtures.openaiRepositoryMock.evaluateAnswer).not.toHaveBeenCalled();
    });

    it('should detect cheating when answers differ only in case', async () => {
      const result = await fixtures.whenExecute({
        ...fixtures.body,
        correctAnswer: 'La Révolution Française',
        answer: 'la révolution française',
      });

      expect(result.isCheating).toBe(true);
      expect(result.score).toBe(0);
      expect(fixtures.openaiRepositoryMock.evaluateAnswer).not.toHaveBeenCalled();
    });

    it('should detect cheating when answers differ only in accents', async () => {
      const result = await fixtures.whenExecute({
        ...fixtures.body,
        correctAnswer: 'éléphant',
        answer: 'elephant',
      });

      expect(result.isCheating).toBe(true);
      expect(result.score).toBe(0);
      expect(fixtures.openaiRepositoryMock.evaluateAnswer).not.toHaveBeenCalled();
    });

    it('should detect cheating when answers differ only in punctuation', async () => {
      const result = await fixtures.whenExecute({
        ...fixtures.body,
        correctAnswer: 'crise financière, inégalités sociales.',
        answer: 'crise financiere inegalites sociales',
      });

      expect(result.isCheating).toBe(true);
      expect(result.score).toBe(0);
      expect(fixtures.openaiRepositoryMock.evaluateAnswer).not.toHaveBeenCalled();
    });

    it('should detect cheating when answers differ only in extra whitespace', async () => {
      const result = await fixtures.whenExecute({
        ...fixtures.body,
        correctAnswer: 'la  révolution',
        answer: 'la revolution',
      });

      expect(result.isCheating).toBe(true);
      expect(result.score).toBe(0);
      expect(fixtures.openaiRepositoryMock.evaluateAnswer).not.toHaveBeenCalled();
    });
  });

  describe('when answers differ', () => {
    it('should delegate to OpenAI and return its result', async () => {
      fixtures.whenOpenAiReturnsEvaluation();

      const result = await fixtures.whenExecute({
        ...fixtures.body,
        answer: 'Une réponse différente',
      });

      expect(fixtures.openaiRepositoryMock.evaluateAnswer).toHaveBeenCalledWith({
        ...fixtures.body,
        answer: 'Une réponse différente',
      });
      expect(result).toEqual(fixtures.openaiEvaluationResult);
    });

    it('should pass the full body to OpenAI including explanation', async () => {
      fixtures.whenOpenAiReturnsEvaluation();

      await fixtures.whenExecute({
        ...fixtures.body,
        answer: 'Mauvaise réponse',
        explanation: 'Contexte du cours important',
      });

      expect(fixtures.openaiRepositoryMock.evaluateAnswer).toHaveBeenCalledWith(
        expect.objectContaining({ explanation: 'Contexte du cours important' }),
      );
    });

    it('should propagate errors thrown by OpenAI', async () => {
      fixtures.whenOpenAiThrows(new Error('OpenAI failure'));

      await expect(fixtures.whenExecute({ ...fixtures.body, answer: 'Mauvaise réponse' })).rejects.toThrow(
        'OpenAI failure',
      );
    });
  });
});

class Fixtures {
  public readonly body: EvaluateAnswerBody = {
    questionText: 'Quelles sont les causes de la Révolution française ?',
    correctAnswer: 'Crise financière, inégalités sociales, influence des Lumières',
    answer: 'Crise financière, inégalités sociales, influence des Lumières',
    explanation: 'La Révolution française a été causée par plusieurs facteurs.',
  };

  public readonly openaiEvaluationResult: EvaluateAnswerResponse = {
    score: 0.5,
    feedback: 'Bonne tentative, il manque quelques éléments.',
    concepts: [{ name: 'crise financière', score: 1 }],
    missingElements: ['inégalités sociales', 'influence des Lumières'],
    suggestedAction: 'A',
    actionPrompt: 'Peux-tu me donner un autre élément ?',
  };

  public readonly openaiRepositoryMock = {
    evaluateAnswer: jest.fn(),
    generateQuestions: jest.fn(),
  };

  public readonly useCase: EvaluateAnswerUseCase;

  constructor() {
    this.useCase = new EvaluateAnswerUseCase(this.openaiRepositoryMock as unknown as ILlmProvider);
  }

  whenExecute(body: EvaluateAnswerBody = this.body) {
    return this.useCase.execute(body);
  }

  whenOpenAiReturnsEvaluation() {
    this.openaiRepositoryMock.evaluateAnswer.mockResolvedValue(this.openaiEvaluationResult);
  }

  whenOpenAiThrows(error: Error) {
    this.openaiRepositoryMock.evaluateAnswer.mockRejectedValue(error);
  }
}
