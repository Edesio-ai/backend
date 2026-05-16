import {
  Suggestion,
  SupabaseSuggestion,
  SuggestionLikesCount,
  SupabaseSuggestionLikesCount,
  SupabaseCountLike,
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

  toLikesCount: (data: SupabaseSuggestionLikesCount): SuggestionLikesCount => ({
    id: data.id,
    likesCount: data.likes_count,
  }),

  decrementLikeToSupabase: (likesCount: number): SupabaseCountLike => ({
    likes_count: Math.max(0, (likesCount || 0) - 1),
  }),

  incrementLikeToSupabase: (likesCount: number): SupabaseCountLike => ({
    likes_count: (likesCount || 0) + 1,
  }),
};
