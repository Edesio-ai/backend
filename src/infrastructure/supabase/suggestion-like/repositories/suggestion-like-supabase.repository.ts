import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { SuggestionLikeMapper } from '../mappers/suggestion-like.mapper';
import { type ISuggestionLikeRepository } from 'src/domain/suggestion-like/contracts/suggestion-like.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';

export class SuggestionLikeSupabaseRepository implements ISuggestionLikeRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async getUserLikes(userId: string, suggestionIds: string[]): Promise<string[]> {
    const { data } = await this.supabase
      .from('suggestion_likes')
      .select('suggestion_id')
      .eq('user_id', userId)
      .in('suggestion_id', suggestionIds);

    return data?.map(SuggestionLikeMapper.toUserLikeSuggestionId) ?? [];
  }

  public async getSuggestionLikeByUserAndSuggestionId(userId: string, suggestionId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('suggestion_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('suggestion_id', suggestionId)
      .maybeSingle();

    if (error) {
      console.error(`Error getting suggestion like by user and suggestion id: ${error.message}`);
      throw new ServerError(error.message);
    }

    return data?.id ?? null;
  }

  public async deleteSuggestionLikeById(likeId: string): Promise<void> {
    const { error } = await this.supabase.from('suggestion_likes').delete().eq('id', likeId);

    if (error) {
      console.error(`Error deleting suggestion like by id: ${error.message}`);
      throw new ServerError(error.message);
    }
  }

  public async createSuggestionLike(suggestionId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('suggestion_likes')
      .insert(SuggestionLikeMapper.toInsert(suggestionId, userId));

    if (error) {
      console.error(`Error creating suggestion like: ${error.message}`);
      throw new ServerError(error.message);
    }
  }
}
