import {
  Suggestion,
  SupabaseSuggestion,
  SuggestionLikesCount,
  SupabaseSuggestionLikesCount,
  SupabaseCountLike,
  SuggestionToInsert,
  SupabaseSuggestionToInsert,
} from 'src/domain/suggestion/suggestion.type';

export const SuggestionMapper = {
  toInsert: (body: SuggestionToInsert): SupabaseSuggestionToInsert => ({
    user_id: body.userId,
    user_email: body.userEmail,
    user_name: body.userName,
    category: body.category,
    title: body.title,
    content: body.content,
    likes_count: body.likesCount,
  }),
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
