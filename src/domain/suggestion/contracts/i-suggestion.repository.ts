import { Suggestion, SuggestionLikesCount, SuggestionToInsert } from '../suggestion.type';

export const SUGGESTION_REPOSITORY = Symbol('SUGGESTION_REPOSITORY');

export interface ISuggestionRepository {
  getSuggestionLikesCountById(suggestionId: string): Promise<SuggestionLikesCount>;
  getSuggestions(category: string): Promise<Suggestion[]>;
  decrementLike(suggestionId: string, likesCount: number): Promise<void>;
  incrementLike(suggestionId: string, likesCount: number): Promise<void>;
  createSuggestion(body: SuggestionToInsert): Promise<Suggestion | null>;
  getSuggestionById(suggestionId: string): Promise<Suggestion | null>;
  deleteSuggestion(suggestionId: string): Promise<void>;
}
