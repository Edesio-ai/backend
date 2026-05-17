import type { ISuggestionRepository } from 'src/domain/suggestion/contracts/i-suggestion.repository';

export function createMockSuggestionRepository(): jest.Mocked<ISuggestionRepository> {
  return {
    getSuggestionLikesCountById: jest.fn(),
    getSuggestions: jest.fn(),
    decrementLike: jest.fn(),
    incrementLike: jest.fn(),
    createSuggestion: jest.fn(),
  };
}
