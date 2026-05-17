import { SupabaseClient } from '@supabase/supabase-js';
import { ISuggestionRepository } from 'src/domain/suggestion/contracts/i-suggestion.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { Inject } from '@nestjs/common';
import {
  Suggestion,
  SuggestionLikesCount,
  SuggestionToInsert,
} from 'src/domain/suggestion/suggestion.type';
import { SuggestionMapper } from '../mappers/suggestion.mapper';

export class SuggestionSupabaseRepository implements ISuggestionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  async getSuggestions(category: string): Promise<Suggestion[]> {
    const { data, error } = await this.supabase
      .from('suggestions')
      .select('*')
      .eq('category', category)
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        `Error fetching suggestions for category ${category}: ${error.message}`,
      );
      throw new ServerError(error.message);
    }

    return data?.map(SuggestionMapper.toDomain) ?? [];
  }

  async getSuggestionLikesCountById(
    suggestionId: string,
  ): Promise<SuggestionLikesCount> {
    const { data, error } = await this.supabase
      .from('suggestions')
      .select('id, likes_count')
      .eq('id', suggestionId)
      .single();

    if (error) {
      console.error(
        `Error fetching suggestion by id ${suggestionId}: ${error.message}`,
      );
      throw new ServerError(error.message);
    }

    return SuggestionMapper.toLikesCount(data);
  }

  async decrementLike(suggestionId: string, likesCount: number): Promise<void> {
    const { error } = await this.supabase
      .from('suggestions')
      .update(SuggestionMapper.decrementLikeToSupabase(likesCount))
      .eq('id', suggestionId);

    if (error) {
      console.error(
        `Error decrementing like for suggestion ${suggestionId}: ${error.message}`,
      );
      throw new ServerError(error.message);
    }
  }

  async incrementLike(suggestionId: string, likesCount: number): Promise<void> {
    const { error } = await this.supabase
      .from('suggestions')
      .update(SuggestionMapper.incrementLikeToSupabase(likesCount))
      .eq('id', suggestionId);

    if (error) {
      console.error(
        `Error incrementing like for suggestion ${suggestionId}: ${error.message}`,
      );
      throw new ServerError(error.message);
    }
  }

  async createSuggestion(body: SuggestionToInsert): Promise<Suggestion | null> {
    const { data, error } = await this.supabase
      .from('suggestions')
      .insert(SuggestionMapper.toInsert(body))
      .select()
      .single();

    if (error) {
      console.error(`Error creating suggestion: ${error.message}`);
      throw new ServerError(error.message);
    }

    return SuggestionMapper.toDomain(data);
  }
}
