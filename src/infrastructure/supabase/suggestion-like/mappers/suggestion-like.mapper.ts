import { SupabaseInsertSuggestionLike, SupabaseUserLike } from 'src/domain/suggestion-like/suggestion-like.type';

export const SuggestionLikeMapper = {
  toUserLikeSuggestionId: (data: SupabaseUserLike): string => data.suggestion_id,

  toInsert: (suggestionId: string, userId: string): SupabaseInsertSuggestionLike => ({
    suggestion_id: suggestionId,
    user_id: userId,
  }),
};
