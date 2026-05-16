export type Suggestion = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  category: string;
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
  category: string;
  title: string;
  content: string;
  likes_count: number;
  created_at: string;
};

export type SupabaseUserLike = {
  suggestion_id: string;
};
