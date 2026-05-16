import { SupabaseClient } from '@supabase/supabase-js';
import { ISuggestionRepository } from 'src/domain/suggestion/contracts/i-suggestion.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { Inject } from '@nestjs/common';
import { Suggestion } from 'src/domain/suggestion/suggestion.type';
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

  async getUserLikes(
    userId: string,
    suggestionIds: string[],
  ): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('suggestion_likes')
      .select('suggestion_id')
      .eq('user_id', userId)
      .in('suggestion_id', suggestionIds);

    return data?.map(SuggestionMapper.toUserLike) ?? [];
  }
}
