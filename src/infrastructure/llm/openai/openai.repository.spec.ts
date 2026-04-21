import { OpenaiRepository } from './openai.repository';
import { QuestionGenerationConfig } from 'src/domain/teaching/types/question.type';
import { OpenAiServerError } from 'src/domain/shared/llm/errors/open-ai.error';

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

  it('should throw OpenAiServerError when response has no content', async () => {
    fixtures.whenOpenAiReturnsNoContent();

    await expect(
      fixtures.whenGenerateQuestions('Contenu'),
    ).rejects.toBeInstanceOf(OpenAiServerError);
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
});

class Fixtures {
  public readonly config: QuestionGenerationConfig = {
    totalQuestions: 4,
    multipleChoiceCount: 2,
    openedCount: 2,
    language: 'francais',
  };

  public readonly generatedQuestions = [
    {
      type: 'multiple',
      questionText: 'Q1 ?',
      keyConcepts: [],
      proposals: ['A', 'B', 'C', 'D'],
      correctAnswers: ['A'],
      explanation: 'Explication',
    },
  ];

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
}
