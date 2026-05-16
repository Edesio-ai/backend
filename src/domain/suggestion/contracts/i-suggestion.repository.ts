import { Suggestion } from '../suggestion.type';

export const SUGGESTION_REPOSITORY = Symbol('SUGGESTION_REPOSITORY');

export interface ISuggestionRepository {
  getSuggestions(category: string): Promise<Suggestion[]>;
  getUserLikes(userId: string, suggestionIds: string[]): Promise<string[]>;
}
