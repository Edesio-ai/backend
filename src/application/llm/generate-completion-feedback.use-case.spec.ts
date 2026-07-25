import {
  GenerateCompletionFeedbackBody,
  GenerateCompletionFeedbackUseCase,
} from './generate-completion-feedback.use-case';
import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';

describe('GenerateCompletionFeedbackUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return feedback from the OpenAI repository', async () => {
    fixtures.whenRepositoryReturnsFeedback('Excellent travail !');

    const result = await fixtures.whenExecute();

    expect(result).toBe('Excellent travail !');
    expect(fixtures.openaiRepository.generateCompletionFeedback).toHaveBeenCalledWith({
      ...fixtures.body,
      language: 'francais',
    });
  });

  it('should forward an explicit language to the repository', async () => {
    fixtures.whenRepositoryReturnsFeedback('Great job!');

    await fixtures.whenExecuteWithBody({
      ...fixtures.body,
      language: 'anglais',
    });

    expect(fixtures.openaiRepository.generateCompletionFeedback).toHaveBeenCalledWith({
      ...fixtures.body,
      language: 'anglais',
    });
  });

  it('should propagate repository errors', async () => {
    fixtures.whenRepositoryThrows(new Error('OpenAI indisponible'));

    await expect(fixtures.whenExecute()).rejects.toThrow('OpenAI indisponible');
  });
});

class Fixtures {
  public readonly openaiRepository: jest.Mocked<Pick<ILlmProvider, 'generateCompletionFeedback'>>;
  public readonly useCase: GenerateCompletionFeedbackUseCase;

  public readonly body: GenerateCompletionFeedbackBody = {
    total: 10,
    score: 8,
    courseTitle: 'Histoire',
    studentName: 'Alex',
  };

  constructor() {
    this.openaiRepository = {
      generateCompletionFeedback: jest.fn(),
    };
    this.useCase = new GenerateCompletionFeedbackUseCase(this.openaiRepository as unknown as ILlmProvider);
  }

  whenExecute() {
    return this.useCase.execute(this.body);
  }

  whenExecuteWithBody(body: GenerateCompletionFeedbackBody) {
    return this.useCase.execute(body);
  }

  whenRepositoryReturnsFeedback(text: string) {
    this.openaiRepository.generateCompletionFeedback.mockResolvedValue(text);
  }

  whenRepositoryThrows(error: Error) {
    this.openaiRepository.generateCompletionFeedback.mockRejectedValue(error);
  }
}
