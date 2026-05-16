import { SuggestionLikeMapper } from './suggestion-like.mapper';
import {
  SupabaseInsertSuggestionLike,
  SupabaseUserLike,
} from 'src/domain/suggestion-like/suggestion-like.type';

describe('SuggestionLikeMapper', () => {
  it('toUserLikeSuggestionId maps suggestion_id', () => {
    const row: SupabaseUserLike = { suggestion_id: 'sg-99' };
    expect(SuggestionLikeMapper.toUserLikeSuggestionId(row)).toBe('sg-99');
  });

  it('toInsert maps ids to snake_case payload', () => {
    const row: SupabaseInsertSuggestionLike = SuggestionLikeMapper.toInsert(
      'sg-1',
      'user-a',
    );
    expect(row).toEqual({
      suggestion_id: 'sg-1',
      user_id: 'user-a',
    });
  });
});
