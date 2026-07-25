import { ForbiddenException } from '@nestjs/common';
import { GetSuggestionsUseCase } from './get-suggestions.use-case';
import { User } from '../../domain/auth/types/auth.type';
import { Suggestion } from '../../domain/suggestion/suggestion.type';
import { ISuggestionRepository } from '../../domain/suggestion/contracts/i-suggestion.repository';
import { ISuggestionLikeRepository } from '../../domain/suggestion-like/contracts/suggestion-like.repository';
import { createMockSuggestionRepository } from 'src/testing/mock-suggestion-repository';
import { createMockSuggestionLikeRepository } from 'src/testing/mock-suggestion-like-repository';

describe('GetSuggestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw ForbiddenException when user role does not match category', async () => {
    const promise = fixtures.whenExecuteWith('teacher', fixtures.studentUser);

    await fixtures.thenThrowsForbidden(promise);
    fixtures.thenRepositoryNotCalled();
  });

  it('should return suggestions with like flags when role matches category', async () => {
    fixtures.whenRepositoryReturnsSuggestionsAndPartialLikes();

    const result = await fixtures.whenExecuteWith('teacher', fixtures.teacherUser);

    fixtures.thenGetSuggestionsCalledWith('teacher');
    fixtures.thenGetUserLikesCalledWith(fixtures.teacherUser.id, ['s1', 's2']);
    fixtures.thenReturnsSuggestionsWithLikeStatus(result);
  });

  it('should still call getUserLikes with empty ids when no suggestions', async () => {
    fixtures.whenRepositoryReturnsEmptySuggestions();

    const result = await fixtures.whenExecuteWith('teacher', fixtures.teacherUser);

    fixtures.thenGetSuggestionsCalledWith('teacher');
    fixtures.thenGetUserLikesCalledWith(fixtures.teacherUser.id, []);
    expect(result).toEqual([]);
  });
});

class Fixtures {
  public readonly suggestionRepository: jest.Mocked<ISuggestionRepository>;
  public readonly suggestionLikeRepository: jest.Mocked<ISuggestionLikeRepository>;
  public readonly useCase: GetSuggestionsUseCase;

  public readonly teacherUser: User;
  public readonly studentUser: User;
  public readonly suggestions: Suggestion[];

  constructor() {
    this.suggestionRepository = createMockSuggestionRepository();
    this.suggestionLikeRepository = createMockSuggestionLikeRepository();
    this.useCase = new GetSuggestionsUseCase(this.suggestionRepository, this.suggestionLikeRepository);

    this.teacherUser = {
      id: 'u-teacher',
      email: 't@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'teacher' },
    };

    this.studentUser = {
      id: 'u-student',
      email: 's@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'student' },
    };

    this.suggestions = [
      {
        id: 's1',
        userId: 'author-1',
        userEmail: 'a@x.com',
        userName: 'Ann',
        category: 'teacher',
        title: 'Title one',
        content: 'Body',
        likesCount: 3,
        createdAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 's2',
        userId: 'author-2',
        userEmail: null,
        userName: null,
        category: 'teacher',
        title: 'Title two',
        content: 'More',
        likesCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
  }

  whenExecuteWith(category: string, user: User) {
    return this.useCase.execute(category, user);
  }

  whenRepositoryReturnsSuggestionsAndPartialLikes() {
    this.suggestionRepository.getSuggestions.mockResolvedValue(this.suggestions);
    this.suggestionLikeRepository.getUserLikes.mockResolvedValue(['s1']);
  }

  whenRepositoryReturnsEmptySuggestions() {
    this.suggestionRepository.getSuggestions.mockResolvedValue([]);
    this.suggestionLikeRepository.getUserLikes.mockResolvedValue([]);
  }

  async thenThrowsForbidden(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ForbiddenException);
    await expect(promise).rejects.toThrow('You are not authorized to access this resource');
  }

  thenRepositoryNotCalled() {
    expect(this.suggestionRepository.getSuggestions).not.toHaveBeenCalled();
    expect(this.suggestionLikeRepository.getUserLikes).not.toHaveBeenCalled();
  }

  thenGetSuggestionsCalledWith(category: string) {
    expect(this.suggestionRepository.getSuggestions).toHaveBeenCalledWith(category);
    expect(this.suggestionRepository.getSuggestions).toHaveBeenCalledTimes(1);
  }

  thenGetUserLikesCalledWith(userId: string, ids: string[]) {
    expect(this.suggestionLikeRepository.getUserLikes).toHaveBeenCalledWith(userId, ids);
    expect(this.suggestionLikeRepository.getUserLikes).toHaveBeenCalledTimes(1);
  }

  thenReturnsSuggestionsWithLikeStatus(result: Suggestion[]) {
    expect(result).toEqual([
      { ...this.suggestions[0], userHasLiked: true },
      { ...this.suggestions[1], userHasLiked: false },
    ]);
  }
}
