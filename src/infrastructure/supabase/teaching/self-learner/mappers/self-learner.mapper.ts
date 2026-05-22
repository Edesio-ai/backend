import {
  SelfLearner,
  SelfLearnerSupabase,
  SelfLearnerToInsert,
  SelfLearnerToInsertSupabase,
} from 'src/domain/teaching/self-learner/types/self-learner.type';

export class SelfLearnerMapper {
  static toInsert(payload: SelfLearnerToInsert): SelfLearnerToInsertSupabase {
    return {
      supabase_user_id: payload.supabaseUserId,
      name: payload.name,
      email: payload.email,
    };
  }

  static toDomain(data: SelfLearnerSupabase): SelfLearner {
    return {
      id: data.id,
      supabaseUserId: data.supabase_user_id,
      name: data.name,
      email: data.email,
      createdAt: data.created_at,
    };
  }
}
