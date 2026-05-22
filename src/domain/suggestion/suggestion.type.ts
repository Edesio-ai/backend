export type Suggestion = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  category: 'teacher' | 'student' | 'establishment' | 'self-learner';
  title: string;
  content: string;
  likesCount: number;
  createdAt: string;
  userHasLiked?: boolean;
};

export type SupabaseSuggestion = {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  category: 'teacher' | 'student' | 'establishment' | 'self-learner';
  title: string;
  content: string;
  likes_count: number;
  created_at: string;
};

export type SuggestionLikesCount = Pick<Suggestion, 'id' | 'likesCount'>;
export type SupabaseSuggestionLikesCount = Pick<
  SupabaseSuggestion,
  'id' | 'likes_count'
>;
export type SupabaseCountLike = Pick<SupabaseSuggestion, 'likes_count'>;
export type SuggestionToInsert = Omit<
  Suggestion,
  'id' | 'createdAt' | 'userHasLiked'
>;
export type SupabaseSuggestionToInsert = Omit<
  SupabaseSuggestion,
  'id' | 'created_at'
>;
