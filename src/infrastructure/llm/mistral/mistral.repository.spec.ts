import { Mistral } from '@mistralai/mistralai';
jest.mock('@mistralai/mistralai', () => ({
  Mistral: jest.fn(),
}));

import { ServerError } from 'src/domain/shared/errors/global.errors';
import type { QuestionGenerationConfig } from 'src/domain/llm/types/openai.type';
import { MistralProvider } from './mistral.repository';

describe('MistralProvider', () => {
  describe('generateQuestions', () => {
    let fixtures: GenerateQuestionsFixtures;

    beforeEach(() => {
      fixtures = new GenerateQuestionsFixtures();
    });

    it('returns parsed questions from the API response', async () => {
      fixtures.whenApiReturnsContent(JSON.stringify({ questions: fixtures.generatedQuestions }));

      const result = await fixtures.whenGenerate();

      expect(result).toEqual(fixtures.generatedQuestions);
      expect(fixtures.chatCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mistral-large-latest',
          messages: expect.any(Array),
          responseFormat: { type: 'json_object' },
        }),
      );
    });

    it('truncates content longer than 15000 characters', async () => {
      const longContent = 'a'.repeat(16000);
      fixtures.whenApiReturnsContent(JSON.stringify({ questions: fixtures.generatedQuestions }));

      await fixtures.provider.generateQuestions(longContent, fixtures.config);

      const call = fixtures.chatCompleteMock.mock.calls[0][0];
      const userPromptMessage = call.messages.find((m: { role: string }) => m.role === 'user');
      expect(userPromptMessage.content).toContain('[Contenu tronqué pour respecter la limite]');
      expect(userPromptMessage.content).not.toContain(longContent);
    });

    it('throws ServerError when API returns no content', async () => {
      fixtures.whenApiReturnsContent(null);

      await expect(fixtures.whenGenerate()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('evaluateAnswer', () => {
    let fixtures: EvaluateAnswerFixtures;

    beforeEach(() => {
      fixtures = new EvaluateAnswerFixtures();
    });

    it('returns mapped evaluation from the API response', async () => {
      fixtures.whenApiReturnsContent(JSON.stringify(fixtures.apiEvaluation));

      const result = await fixtures.whenEvaluate();

      expect(result).toMatchObject({
        score: fixtures.apiEvaluation.score,
        feedback: fixtures.apiEvaluation.feedback,
        concepts: fixtures.apiEvaluation.concepts,
        missingElements: fixtures.apiEvaluation.missingElements,
        suggestedAction: fixtures.apiEvaluation.suggestedAction,
        actionPrompt: fixtures.apiEvaluation.actionPrompt,
        correctAnswer: fixtures.body.correctAnswer,
      });
      expect(fixtures.chatCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'mistral-small-latest' }),
      );
    });

    it('strips ```json fences from the response before parsing', async () => {
      fixtures.whenApiReturnsContent('```json\n' + JSON.stringify(fixtures.apiEvaluation) + '\n```');

      const result = await fixtures.whenEvaluate();

      expect(result.score).toBe(fixtures.apiEvaluation.score);
    });

    it('throws ServerError when API returns no content', async () => {
      fixtures.whenApiReturnsContent(null);

      await expect(fixtures.whenEvaluate()).rejects.toBeInstanceOf(ServerError);
    });

    it('defaults output language to the question language in the prompts', async () => {
      fixtures.whenApiReturnsContent(JSON.stringify(fixtures.apiEvaluation));

      await fixtures.whenEvaluate();

      const call = fixtures.chatCompleteMock.mock.calls[0][0];
      expect(call.messages[0].content).toContain('langue du cours');
      expect(call.messages[1].content).toContain('LANGUE DU COURS');
    });

    it('passes an explicit course language into the prompts', async () => {
      fixtures.whenApiReturnsContent(JSON.stringify(fixtures.apiEvaluation));

      await fixtures.whenEvaluateWithLanguage('anglais');

      const call = fixtures.chatCompleteMock.mock.calls[0][0];
      expect(call.messages[0].content).toContain('anglais');
      expect(call.messages[1].content).toContain('anglais');
    });
  });

  describe('generateCompletionFeedback', () => {
    let fixtures: CompletionFeedbackFixtures;

    beforeEach(() => {
      fixtures = new CompletionFeedbackFixtures();
    });

    it('returns feedback and notionsToReview from a JSON API response', async () => {
      fixtures.whenApiReturnsFeedback(
        JSON.stringify({
          feedback: 'Excellent travail !',
          notionsToReview: ['les causes de la Révolution'],
        }),
      );

      const result = await fixtures.whenGenerate();

      expect(result).toEqual({
        feedback: 'Excellent travail !',
        notionsToReview: ['les causes de la Révolution'],
      });
      expect(fixtures.chatCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mistral-small-latest',
          responseFormat: { type: 'json_object' },
        }),
      );
    });

    it('includes course content and answers in the user prompt', async () => {
      fixtures.whenApiReturnsFeedback(JSON.stringify({ feedback: 'ok', notionsToReview: [] }));

      await fixtures.whenGenerate();

      const call = fixtures.chatCompleteMock.mock.calls[0][0];
      expect(call.messages[1].content).toContain('Chapitre Révolution');
      expect(call.messages[1].content).toContain('Quelles sont les causes ?');
    });

    it('accepts alternate notions keys from the model', async () => {
      fixtures.whenApiReturnsFeedback(
        JSON.stringify({
          feedback: 'Continue !',
          notionsAReviser: ['les causes'],
        }),
      );

      const result = await fixtures.whenGenerate();

      expect(result.notionsToReview).toEqual(['les causes']);
    });

    it('falls back to default message when API returns no content', async () => {
      fixtures.whenApiReturnsFeedback(null);

      const result = await fixtures.whenGenerate();

      expect(result).toEqual({
        feedback: 'Bravo pour avoir terminé ce quiz !',
        notionsToReview: [],
      });
    });

    it('throws ServerError when API throws', async () => {
      fixtures.chatCompleteMock.mockRejectedValue(new Error('network'));

      await expect(fixtures.whenGenerate()).rejects.toBeInstanceOf(ServerError);
    });

    it('defaults language to francais in the prompts', async () => {
      fixtures.whenApiReturnsFeedback(JSON.stringify({ feedback: 'ok', notionsToReview: [] }));

      await fixtures.whenGenerate();

      const call = fixtures.chatCompleteMock.mock.calls[0][0];
      expect(call.messages[0].content).toContain('français');
      expect(call.messages[1].content).toContain('français');
    });

    it('passes an explicit course language into the prompts', async () => {
      fixtures.whenApiReturnsFeedback(JSON.stringify({ feedback: 'ok', notionsToReview: [] }));

      await fixtures.whenGenerateWithLanguage('anglais');

      const call = fixtures.chatCompleteMock.mock.calls[0][0];
      expect(call.messages[0].content).toContain('anglais');
      expect(call.messages[1].content).toContain('anglais');
    });
  });
});

function buildMistralClient(chatCompleteMock: jest.Mock) {
  return {
    chat: {
      complete: chatCompleteMock,
    },
  };
}

class GenerateQuestionsFixtures {
  public readonly config: QuestionGenerationConfig = {
    totalQuestions: 2,
    singleCount: 1,
    openedCount: 1,
    language: 'francais',
  };

  public readonly generatedQuestions = [
    {
      type: 'single',
      questionText: 'Q1?',
      keyConcepts: ['k'],
      proposals: ['A', 'B'],
      correctAnswers: ['A'],
      explanation: 'e',
    },
  ];

  public readonly chatCompleteMock = jest.fn();
  public readonly provider: MistralProvider;

  constructor() {
    this.provider = new MistralProvider(buildMistralClient(this.chatCompleteMock) as unknown as Mistral);
  }

  whenGenerate() {
    return this.provider.generateQuestions('Contenu du cours', this.config);
  }

  whenApiReturnsContent(content: string | null) {
    this.chatCompleteMock.mockResolvedValue({
      choices: [{ message: { content } }],
    });
  }
}

class EvaluateAnswerFixtures {
  public readonly body = {
    questionText: 'Causes de la Révolution ?',
    correctAnswer: 'Inégalités, crise financière',
    answer: 'Les inégalités',
    explanation: 'Contexte socio-économique.',
  };

  public readonly apiEvaluation = {
    score: 0.6,
    feedback: 'Bonne tentative.',
    concepts: [{ name: 'inégalités', score: 1 }],
    missingElements: ['crise financière'],
    suggestedAction: 'A',
    actionPrompt: 'Peux-tu compléter ?',
  };

  public readonly chatCompleteMock = jest.fn();
  public readonly provider: MistralProvider;

  constructor() {
    this.provider = new MistralProvider(buildMistralClient(this.chatCompleteMock) as unknown as Mistral);
  }

  whenEvaluate() {
    return this.provider.evaluateAnswer(this.body);
  }

  whenEvaluateWithLanguage(language: 'francais' | 'anglais' | 'espagnol' | 'allemand') {
    return this.provider.evaluateAnswer({
      ...this.body,
      language,
    });
  }

  whenApiReturnsContent(content: string | null) {
    this.chatCompleteMock.mockResolvedValue({
      choices: [{ message: { content } }],
    });
  }
}

class CompletionFeedbackFixtures {
  public readonly body = {
    total: 10,
    score: 8,
    courseTitle: 'Histoire',
    courseContent: 'Chapitre Révolution : causes et conséquences.',
    studentName: 'Alex',
    language: 'francais' as const,
    answers: [
      {
        questionText: 'Quelles sont les causes ?',
        score: 0.4,
        missingElements: ['crise financière'],
      },
    ],
  };

  public readonly chatCompleteMock = jest.fn();
  public readonly provider: MistralProvider;

  constructor() {
    this.provider = new MistralProvider(buildMistralClient(this.chatCompleteMock) as unknown as Mistral);
  }

  whenGenerate() {
    return this.provider.generateCompletionFeedback(this.body);
  }

  whenGenerateWithLanguage(language: 'francais' | 'anglais' | 'espagnol' | 'allemand') {
    return this.provider.generateCompletionFeedback({
      ...this.body,
      language,
    });
  }

  whenApiReturnsFeedback(content: string | null) {
    this.chatCompleteMock.mockResolvedValue({
      choices: [{ message: { content } }],
    });
  }
}
