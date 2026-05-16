import type { ISuggestionRepository } from 'src/domain/suggestion/contracts/i-suggestion.repository';

export function createMockSuggestionRepository(): jest.Mocked<ISuggestionRepository> {
  return {
    getSuggestions: jest.fn(),
    getUserLikes: jest.fn(),
  };
}
