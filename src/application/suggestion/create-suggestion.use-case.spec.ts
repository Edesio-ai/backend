import { CreateSuggestionUseCase } from './create-suggestion.use-case';
import { User } from '../../domain/auth/types/auth.type';
import { Suggestion } from '../../domain/suggestion/suggestion.type';
import { ISuggestionRepository } from '../../domain/suggestion/contracts/i-suggestion.repository';
import { createMockSuggestionRepository } from 'src/testing/mock-suggestion-repository';

describe('CreateSuggestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create suggestion with user fields and return it with userHasLiked false', async () => {
    fixtures.whenRepositoryReturnsCreatedSuggestion();

    const result = await fixtures.whenExecute();

    fixtures.thenCreateCalledWithExpectedInsert();
    expect(result).toEqual({
      ...fixtures.createdSuggestion,
      userHasLiked: false,
    });
  });

  it('should return null when repository returns null', async () => {
    fixtures.whenRepositoryReturnsNull();

    const result = await fixtures.whenExecute();

    fixtures.thenCreateCalledWithExpectedInsert();
    expect(result).toBeNull();
  });
});

class Fixtures {
  public readonly suggestionRepository: jest.Mocked<ISuggestionRepository>;
  public readonly useCase: CreateSuggestionUseCase;

  public readonly user: User;
  public readonly body: {
    title: string;
    content: string;
    category: 'teacher';
  };
  public readonly createdSuggestion: Suggestion;

  constructor() {
    this.suggestionRepository = createMockSuggestionRepository();
    this.useCase = new CreateSuggestionUseCase(this.suggestionRepository);

    this.body = {
      title: 'Une idée utile',
      content: 'Description détaillée du besoin pour la classe.',
      category: 'teacher',
    };

    this.user = {
      id: 'u-1',
      email: 'author@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'teacher', firstname: 'Camille' },
    };

    this.createdSuggestion = {
      id: 'sg-new',
      userId: this.user.id,
      userEmail: this.user.email,
      userName: 'Camille',
      category: 'teacher',
      title: this.body.title,
      content: this.body.content,
      likesCount: 0,
      createdAt: '2026-03-01T10:00:00.000Z',
    };
  }

  whenExecute() {
    return this.useCase.execute(this.body, this.user);
  }

  whenRepositoryReturnsCreatedSuggestion() {
    this.suggestionRepository.createSuggestion.mockResolvedValue(this.createdSuggestion);
  }

  whenRepositoryReturnsNull() {
    this.suggestionRepository.createSuggestion.mockResolvedValue(null);
  }

  thenCreateCalledWithExpectedInsert() {
    expect(this.suggestionRepository.createSuggestion).toHaveBeenCalledWith({
      userId: this.user.id,
      userEmail: this.user.email,
      userName: 'Camille',
      category: this.body.category,
      title: this.body.title,
      content: this.body.content,
      likesCount: 0,
    });
    expect(this.suggestionRepository.createSuggestion).toHaveBeenCalledTimes(1);
  }
}
