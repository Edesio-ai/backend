import { NotFoundException } from '@nestjs/common';
import { LikeSuggestionUseCase } from './like-suggestion.use-case';
import { User } from '../../domain/auth/types/auth.type';
import { ISuggestionRepository } from '../../domain/suggestion/contracts/i-suggestion.repository';
import { ISuggestionLikeRepository } from '../../domain/suggestion-like/contracts/suggestion-like.repository';
import { createMockSuggestionRepository } from 'src/testing/mock-suggestion-repository';
import { createMockSuggestionLikeRepository } from 'src/testing/mock-suggestion-like-repository';

describe('LikeSuggestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundException when suggestion is missing', async () => {
    fixtures.whenSuggestionCountReturnsNull();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowsNotFound(promise);
    fixtures.thenLikeLookupNotCalled();
    fixtures.thenMutationsNotCalled();
  });

  it('should unlike when user already liked', async () => {
    fixtures.whenSuggestionExists({ id: 'sg-1', likesCount: 3 });
    fixtures.whenExistingLikeId('like-row-1');

    const result = await fixtures.whenExecute();

    expect(
      fixtures.suggestionLikeRepository.deleteSuggestionLikeById,
    ).toHaveBeenCalledWith('like-row-1');
    expect(fixtures.suggestionRepository.decrementLike).toHaveBeenCalledWith(
      'sg-1',
      3,
    );
    expect(result).toEqual({ liked: false, likesCount: 2 });
    expect(
      fixtures.suggestionLikeRepository.createSuggestionLike,
    ).not.toHaveBeenCalled();
  });

  it('should like when user has not liked yet', async () => {
    fixtures.whenSuggestionExists({ id: 'sg-1', likesCount: 1 });
    fixtures.whenNoExistingLike();

    const result = await fixtures.whenExecute();

    expect(
      fixtures.suggestionLikeRepository.createSuggestionLike,
    ).toHaveBeenCalledWith('sg-1', fixtures.user.id);
    expect(fixtures.suggestionRepository.incrementLike).toHaveBeenCalledWith(
      'sg-1',
      1,
    );
    expect(result).toEqual({ liked: true, likesCount: 2 });
    expect(
      fixtures.suggestionLikeRepository.deleteSuggestionLikeById,
    ).not.toHaveBeenCalled();
  });

  it('should clamp unlike count at zero when likesCount is zero', async () => {
    fixtures.whenSuggestionExists({ id: 'sg-1', likesCount: 0 });
    fixtures.whenExistingLikeId('like-row-1');

    const result = await fixtures.whenExecute();

    expect(result).toEqual({ liked: false, likesCount: 0 });
  });
});

class Fixtures {
  public readonly suggestionRepository: jest.Mocked<ISuggestionRepository>;
  public readonly suggestionLikeRepository: jest.Mocked<ISuggestionLikeRepository>;
  public readonly useCase: LikeSuggestionUseCase;

  public readonly user: User;

  constructor() {
    this.suggestionRepository = createMockSuggestionRepository();
    this.suggestionLikeRepository = createMockSuggestionLikeRepository();
    this.useCase = new LikeSuggestionUseCase(
      this.suggestionRepository,
      this.suggestionLikeRepository,
    );

    this.user = {
      id: 'u-1',
      email: 'u@test.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'teacher' },
    };
  }

  whenExecute() {
    return this.useCase.execute('sg-1', this.user);
  }

  whenSuggestionCountReturnsNull() {
    this.suggestionRepository.getSuggestionLikesCountById.mockResolvedValue(
      null as unknown as { id: string; likesCount: number },
    );
  }

  whenSuggestionExists(payload: { id: string; likesCount: number }) {
    this.suggestionRepository.getSuggestionLikesCountById.mockResolvedValue(
      payload,
    );
  }

  whenExistingLikeId(likeId: string) {
    this.suggestionLikeRepository.getSuggestionLikeByUserAndSuggestionId.mockResolvedValue(
      likeId,
    );
    this.suggestionLikeRepository.deleteSuggestionLikeById.mockResolvedValue();
    this.suggestionRepository.decrementLike.mockResolvedValue();
  }

  whenNoExistingLike() {
    this.suggestionLikeRepository.getSuggestionLikeByUserAndSuggestionId.mockResolvedValue(
      null,
    );
    this.suggestionLikeRepository.createSuggestionLike.mockResolvedValue();
    this.suggestionRepository.incrementLike.mockResolvedValue();
  }

  async thenThrowsNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    await expect(promise).rejects.toThrow('Suggestion not found');
  }

  thenLikeLookupNotCalled() {
    expect(
      this.suggestionLikeRepository.getSuggestionLikeByUserAndSuggestionId,
    ).not.toHaveBeenCalled();
  }

  thenMutationsNotCalled() {
    expect(
      this.suggestionLikeRepository.deleteSuggestionLikeById,
    ).not.toHaveBeenCalled();
    expect(
      this.suggestionLikeRepository.createSuggestionLike,
    ).not.toHaveBeenCalled();
    expect(this.suggestionRepository.decrementLike).not.toHaveBeenCalled();
    expect(this.suggestionRepository.incrementLike).not.toHaveBeenCalled();
  }
}
