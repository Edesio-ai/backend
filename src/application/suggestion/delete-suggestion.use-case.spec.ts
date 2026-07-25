import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteSuggestionUseCase } from './delete-suggestion.use-case';
import { User } from '../../domain/auth/types/auth.type';
import { Suggestion } from '../../domain/suggestion/suggestion.type';
import { ISuggestionRepository } from '../../domain/suggestion/contracts/i-suggestion.repository';
import { createMockSuggestionRepository } from 'src/testing/mock-suggestion-repository';

describe('DeleteSuggestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete when suggestion exists and belongs to the user', async () => {
    fixtures.whenRepositoryReturnsOwnedSuggestion();

    await fixtures.whenExecute();

    expect(fixtures.suggestionRepository.getSuggestionById).toHaveBeenCalledWith(fixtures.suggestionId);
    expect(fixtures.suggestionRepository.deleteSuggestion).toHaveBeenCalledWith(fixtures.suggestionId);
    expect(fixtures.suggestionRepository.deleteSuggestion).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when suggestion is missing', async () => {
    fixtures.whenRepositoryReturnsNull();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    await expect(promise).rejects.toThrow('Suggestion not found');
    expect(fixtures.suggestionRepository.deleteSuggestion).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when suggestion belongs to another user', async () => {
    fixtures.whenRepositoryReturnsForeignSuggestion();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(ForbiddenException);
    await expect(promise).rejects.toThrow('You are not allowed to delete this suggestion');
    expect(fixtures.suggestionRepository.deleteSuggestion).not.toHaveBeenCalled();
  });
});

class Fixtures {
  public readonly suggestionRepository: jest.Mocked<ISuggestionRepository>;
  public readonly useCase: DeleteSuggestionUseCase;

  public readonly user: User;
  public readonly suggestionId = 'sg-1';
  public readonly ownedSuggestion: Suggestion;

  constructor() {
    this.suggestionRepository = createMockSuggestionRepository();
    this.useCase = new DeleteSuggestionUseCase(this.suggestionRepository);

    this.user = {
      id: 'u-owner',
      email: 'owner@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'teacher', firstname: 'Léa' },
    };

    this.ownedSuggestion = {
      id: this.suggestionId,
      userId: this.user.id,
      userEmail: this.user.email,
      userName: 'Léa',
      category: 'teacher',
      title: 'Feature',
      content: 'Details',
      likesCount: 1,
      createdAt: '2026-02-01T12:00:00.000Z',
    };
  }

  whenExecute() {
    return this.useCase.execute(this.suggestionId, this.user);
  }

  whenRepositoryReturnsOwnedSuggestion() {
    this.suggestionRepository.getSuggestionById.mockResolvedValue(this.ownedSuggestion);
    this.suggestionRepository.deleteSuggestion.mockResolvedValue(undefined);
  }

  whenRepositoryReturnsNull() {
    this.suggestionRepository.getSuggestionById.mockResolvedValue(null);
  }

  whenRepositoryReturnsForeignSuggestion() {
    this.suggestionRepository.getSuggestionById.mockResolvedValue({
      ...this.ownedSuggestion,
      userId: 'u-other',
    });
  }
}
