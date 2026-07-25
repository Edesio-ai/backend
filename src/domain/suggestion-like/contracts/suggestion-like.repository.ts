export const SUGGESTION_LIKE_REPOSITORY = Symbol('SUGGESTION_LIKE_REPOSITORY');

export interface ISuggestionLikeRepository {
  getUserLikes(userId: string, suggestionIds: string[]): Promise<string[]>;
  getSuggestionLikeByUserAndSuggestionId(userId: string, suggestionId: string): Promise<string | null>;
  deleteSuggestionLikeById(likeId: string): Promise<void>;
  createSuggestionLike(suggestionId: string, userId: string): Promise<void>;
}
