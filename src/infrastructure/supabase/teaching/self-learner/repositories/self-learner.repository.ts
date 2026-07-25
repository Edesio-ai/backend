import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { SelfLearner, SelfLearnerToInsert } from 'src/domain/teaching/self-learner/types/self-learner.type';
import { SUPABASE_ADMIN } from '../../../supabase.module';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SelfLearnerMapper } from '../mappers/self-learner.mapper';

export class SelfLearnerRepository implements ISelfLearnerRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async getSelfLearnerByUserId(userId: string): Promise<SelfLearner | null> {
    const { data, error } = await this.supabase
      .from('self_learners')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(`Failed to get self learner by user id: ${userId}`, error);
      throw new ServerError(error.message);
    }

    return data ? SelfLearnerMapper.toDomain(data) : null;
  }

  public async createSelfLearner(payload: SelfLearnerToInsert): Promise<SelfLearner> {
    const { data, error } = await this.supabase
      .from('self_learners')
      .insert(SelfLearnerMapper.toInsert(payload))
      .select()
      .single();

    if (error) {
      console.error(`Failed to create self learner: ${error.message}`, payload);
      throw new ServerError(error.message);
    }

    return SelfLearnerMapper.toDomain(data);
  }
}
