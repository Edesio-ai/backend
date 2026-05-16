import {
  Suggestion,
  SupabaseSuggestion,
  SupabaseUserLike,
} from 'src/domain/suggestion/suggestion.type';

export const SuggestionMapper = {
  toDomain: (data: SupabaseSuggestion): Suggestion => ({
    id: data.id,
    userId: data.user_id,
    userEmail: data.user_email,
    userName: data.user_name,
    category: data.category,
    title: data.title,
    content: data.content,
    likesCount: data.likes_count,
    createdAt: data.created_at,
  }),
  toUserLike: (data: SupabaseUserLike): string => data.suggestion_id,
};
