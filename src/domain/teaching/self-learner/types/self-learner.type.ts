export type SelfLearner = {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: string;
};

export type SelfLearnerSupabase = {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  created_at: string;
};

export type SelfLearnerToInsert = Omit<SelfLearner, 'id' | 'createdAt'>;
export type SelfLearnerToInsertSupabase = Omit<
  SelfLearnerSupabase,
  'id' | 'created_at'
>;
