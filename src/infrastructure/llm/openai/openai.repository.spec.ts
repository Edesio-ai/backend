import { OpenaiRepository } from './openai.repository';
import { QuestionGenerationConfig } from 'src/domain/teaching/types/question.type';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { EvaluateAnswerBody } from 'src/application/question/evaluate-answer.use-case';
import { GenerateCompletionFeedbackBody } from 'src/application/llm/generate-completion-feedback.use-case';

describe('OpenaiRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return parsed questions from OpenAI response', async () => {
    fixtures.whenOpenAiReturnsQuestions();

    const result = await fixtures.whenGenerateQuestions('Contenu du cours');

    expect(result).toEqual(fixtures.generatedQuestions);
    expect(fixtures.completionsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
      }),
    );
  });

  it('should throw ServerError when response has no content', async () => {
    fixtures.whenOpenAiReturnsNoContent();

    await expect(
      fixtures.whenGenerateQuestions('Contenu'),
    ).rejects.toBeInstanceOf(ServerError);
  });

  it('should truncate content longer than 15000 characters', async () => {
    fixtures.whenOpenAiReturnsQuestions();
    const longContent = 'x'.repeat(20000);

    await fixtures.whenGenerateQuestions(longContent);

    const callArgs = fixtures.completionsCreateMock.mock.calls[0][0];
    const userMessage = callArgs.messages.find((m: any) => m.role === 'user')
      .content as string;
    expect(userMessage).toContain('[Contenu tronqué pour respecter la limite]');
    expect(longContent.substring(0, 15000)).toEqual(
      expect.stringMatching(/.{15000}/),
    );
  });

  it('should not truncate content shorter than 15000 characters', async () => {
    fixtures.whenOpenAiReturnsQuestions();
    const shortContent = 'Petit contenu';

    await fixtures.whenGenerateQuestions(shortContent);

    const callArgs = fixtures.completionsCreateMock.mock.calls[0][0];
    const userMessage = callArgs.messages.find((m: any) => m.role === 'user')
      .content as string;
    expect(userMessage).not.toContain('[Contenu tronqué');
  });

  it('should include existing questions context when provided', async () => {
    fixtures.whenOpenAiReturnsQuestions();

    await fixtures.whenGenerateQuestions('Contenu', ['Q déjà existante']);

    const callArgs = fixtures.completionsCreateMock.mock.calls[0][0];
    const userMessage = callArgs.messages.find((m: any) => m.role === 'user')
      .content as string;
    expect(userMessage).toContain('Q déjà existante');
  });

  it('should not include existing questions context when empty', async () => {
    fixtures.whenOpenAiReturnsQuestions();

    await fixtures.whenGenerateQuestions('Contenu', []);

    const callArgs = fixtures.completionsCreateMock.mock.calls[0][0];
    const userMessage = callArgs.messages.find((m: any) => m.role === 'user')
      .content as string;
    expect(userMessage).not.toContain('QUESTIONS DÉJÀ EXISTANTES');
  });

  describe('evaluateAnswer', () => {
    it('should return a parsed evaluation from OpenAI response', async () => {
      fixtures.whenOpenAiReturnsEvaluation();

      const result = await fixtures.whenEvaluateAnswer();

      expect(result.score).toBe(0.8);
      expect(result.feedback).toBe('Très bien !');
      expect(result.concepts).toEqual([{ nom: 'crise financière', score: 1 }]);
      expect(result.missingElements).toEqual([]);
      expect(result.suggestedAction).toBeNull();
      expect(result.actionPrompt).toBeNull();
      expect(result.correctAnswer).toBe(
        fixtures.evaluateAnswerBody.correctAnswer,
      );
    });

    it('should call OpenAI with gpt-4o-mini and json_object format', async () => {
      fixtures.whenOpenAiReturnsEvaluation();

      await fixtures.whenEvaluateAnswer();

      expect(fixtures.completionsCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        }),
      );
    });

    it('should include a system and a user message', async () => {
      fixtures.whenOpenAiReturnsEvaluation();

      await fixtures.whenEvaluateAnswer();

      const callArgs = fixtures.completionsCreateMock.mock.calls[0][0];
      const roles = callArgs.messages.map((m: any) => m.role);
      expect(roles).toContain('system');
      expect(roles).toContain('user');
    });

    it('should throw ServerError when OpenAI returns no content', async () => {
      fixtures.whenOpenAiReturnsNoEvaluationContent();

      await expect(fixtures.whenEvaluateAnswer()).rejects.toBeInstanceOf(
        ServerError,
      );
    });

    it('should handle response wrapped in json markdown fences', async () => {
      fixtures.whenOpenAiReturnsEvaluationWrappedInFences();

      const result = await fixtures.whenEvaluateAnswer();

      expect(result.score).toBe(0.5);
    });

    it('should default concepts to empty array when missing', async () => {
      fixtures.whenOpenAiReturnsEvaluationWithoutOptionalFields();

      const result = await fixtures.whenEvaluateAnswer();

      expect(result.concepts).toEqual([]);
      expect(result.missingElements).toEqual([]);
      expect(result.suggestedAction).toBeNull();
      expect(result.actionPrompt).toBeNull();
    });
  });

  describe('generateCompletionFeedback', () => {
    it('should return trimmed feedback from OpenAI', async () => {
      fixtures.whenOpenAiReturnsCompletionMessage('  Très bien !  ');

      const result = await fixtures.whenGenerateCompletionFeedback(
        fixtures.completionBodyHighScore,
      );

      expect(result).toBe('Très bien !');
    });

    it('should call OpenAI with gpt-4o-mini and completion settings', async () => {
      fixtures.whenOpenAiReturnsCompletionMessage('OK');

      await fixtures.whenGenerateCompletionFeedback(
        fixtures.completionBodyHighScore,
      );

      expect(fixtures.completionsCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 150,
        }),
      );
      expect(
        fixtures.completionsCreateMock.mock.calls[0][0],
      ).not.toHaveProperty('response_format');
    });

    it('should inject high-score context when percent >= 70', async () => {
      fixtures.whenOpenAiReturnsCompletionMessage('msg');

      await fixtures.whenGenerateCompletionFeedback(
        fixtures.completionBodyHighScore,
      );

      const userContent = fixtures.getLastCompletionUserContent();
      expect(userContent).toContain('Félicite-le chaleureusement');
    });

    it('should inject medium-score context when percent between 50 and 69', async () => {
      fixtures.whenOpenAiReturnsCompletionMessage('msg');

      await fixtures.whenGenerateCompletionFeedback(
        fixtures.completionBodyMediumScore,
      );

      const userContent = fixtures.getLastCompletionUserContent();
      expect(userContent).toContain('résultat moyen');
    });

    it('should inject low-score context when percent < 50', async () => {
      fixtures.whenOpenAiReturnsCompletionMessage('msg');

      await fixtures.whenGenerateCompletionFeedback(
        fixtures.completionBodyLowScore,
      );

      const userContent = fixtures.getLastCompletionUserContent();
      expect(userContent).toContain('difficultés');
    });

    it('should use 0% when total is zero', async () => {
      fixtures.whenOpenAiReturnsCompletionMessage('msg');

      await fixtures.whenGenerateCompletionFeedback(
        fixtures.completionBodyZeroTotal,
      );

      const userContent = fixtures.getLastCompletionUserContent();
      expect(userContent).toContain('0/0');
      expect(userContent).toContain('0%');
    });

    it('should return default message when OpenAI content is empty', async () => {
      fixtures.whenOpenAiReturnsCompletionNoContent();

      const result = await fixtures.whenGenerateCompletionFeedback(
        fixtures.completionBodyHighScore,
      );

      expect(result).toBe('Bravo pour avoir terminé ce quiz !');
    });

    it('should throw ServerError when OpenAI client throws', async () => {
      fixtures.whenOpenAiCompletionThrows();

      await expect(
        fixtures.whenGenerateCompletionFeedback(
          fixtures.completionBodyHighScore,
        ),
      ).rejects.toBeInstanceOf(ServerError);
    });
  });
});

class Fixtures {
  public readonly config: QuestionGenerationConfig = {
    totalQuestions: 4,
    singleCount: 2,
    openedCount: 2,
    language: 'francais',
  };

  public readonly generatedQuestions = [
    {
      type: 'single',
      questionText: 'Q1 ?',
      keyConcepts: [],
      proposals: ['A', 'B', 'C', 'D'],
      correctAnswers: ['A'],
      explanation: 'Explication',
    },
  ];

  public readonly evaluateAnswerBody: EvaluateAnswerBody = {
    questionText: 'Quelles sont les causes de la Révolution française ?',
    correctAnswer:
      'Crise financière, inégalités sociales, influence des Lumières',
    answer: "L'argent et les inégalités",
    explanation: 'La Révolution française a été causée par plusieurs facteurs.',
  };

  public readonly completionBodyHighScore: GenerateCompletionFeedbackBody = {
    total: 10,
    score: 8,
    courseTitle: 'Sciences',
    studentName: 'Léa',
  };

  public readonly completionBodyMediumScore: GenerateCompletionFeedbackBody = {
    total: 10,
    score: 6,
    courseTitle: 'Sciences',
    studentName: 'Léa',
  };

  public readonly completionBodyLowScore: GenerateCompletionFeedbackBody = {
    total: 10,
    score: 4,
    courseTitle: 'Sciences',
    studentName: 'Léa',
  };

  public readonly completionBodyZeroTotal: GenerateCompletionFeedbackBody = {
    total: 0,
    score: 0,
    courseTitle: 'Sciences',
    studentName: 'Léa',
  };

  public readonly completionsCreateMock = jest.fn();

  private readonly openaiClientMock = {
    chat: {
      completions: {
        create: this.completionsCreateMock,
      },
    },
  };

  public readonly repository: OpenaiRepository;

  constructor() {
    this.repository = new OpenaiRepository(this.openaiClientMock as any);
  }

  whenGenerateQuestions(content: string, existingQuestions?: string[]) {
    return this.repository.generateQuestions(
      content,
      this.config,
      existingQuestions,
    );
  }

  whenEvaluateAnswer() {
    return this.repository.evaluateAnswer(this.evaluateAnswerBody);
  }

  whenGenerateCompletionFeedback(body: GenerateCompletionFeedbackBody) {
    return this.repository.generateCompletionFeedback(body);
  }

  getLastCompletionUserContent(): string {
    const callArgs = this.completionsCreateMock.mock.calls.at(-1)?.[0];
    const userMessage = callArgs?.messages?.find((m: any) => m.role === 'user');
    return userMessage?.content as string;
  }

  whenOpenAiReturnsQuestions() {
    this.completionsCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({ questions: this.generatedQuestions }),
          },
        },
      ],
    });
  }

  whenOpenAiReturnsNoContent() {
    this.completionsCreateMock.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });
  }

  whenOpenAiReturnsEvaluation() {
    this.completionsCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 0.8,
              feedback: 'Très bien !',
              concepts: [{ nom: 'crise financière', score: 1 }],
              missingElements: [],
              suggestedAction: null,
              actionPrompt: null,
            }),
          },
        },
      ],
    });
  }

  whenOpenAiReturnsEvaluationWrappedInFences() {
    this.completionsCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content:
              '```json\n' +
              JSON.stringify({
                score: 0.5,
                feedback: 'Partiel.',
                concepts: [],
                missingElements: ['inégalités sociales'],
                suggestedAction: 'A',
                actionPrompt: 'Peux-tu compléter ?',
              }) +
              '\n```',
          },
        },
      ],
    });
  }

  whenOpenAiReturnsEvaluationWithoutOptionalFields() {
    this.completionsCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 0.3,
              feedback: 'À revoir.',
            }),
          },
        },
      ],
    });
  }

  whenOpenAiReturnsNoEvaluationContent() {
    this.completionsCreateMock.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });
  }

  whenOpenAiReturnsCompletionMessage(content: string) {
    this.completionsCreateMock.mockResolvedValue({
      choices: [{ message: { content } }],
    });
  }

  whenOpenAiReturnsCompletionNoContent() {
    this.completionsCreateMock.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });
  }

  whenOpenAiCompletionThrows() {
    this.completionsCreateMock.mockRejectedValue(new Error('network'));
  }
}
