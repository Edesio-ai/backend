import type { ISuggestionLikeRepository } from 'src/domain/suggestion-like/contracts/suggestion-like.repository';

export function createMockSuggestionLikeRepository(): jest.Mocked<ISuggestionLikeRepository> {
  return {
    getUserLikes: jest.fn(),
    getSuggestionLikeByUserAndSuggestionId: jest.fn(),
    deleteSuggestionLikeById: jest.fn(),
    createSuggestionLike: jest.fn(),
  };
}
