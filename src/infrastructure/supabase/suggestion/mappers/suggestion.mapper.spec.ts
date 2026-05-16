import { SuggestionMapper } from './suggestion.mapper';
import {
  SupabaseSuggestion,
  SupabaseSuggestionLikesCount,
} from 'src/domain/suggestion/suggestion.type';

describe('SuggestionMapper', () => {
  const supabaseRow: SupabaseSuggestion = {
    id: 'sg-1',
    user_id: 'author-1',
    user_email: 'a@test.com',
    user_name: 'Alex',
    category: 'teacher',
    title: 'Un titre',
    content: 'Contenu',
    likes_count: 5,
    created_at: '2026-02-01T12:00:00.000Z',
  };

  it('toDomain maps snake_case row to domain Suggestion', () => {
    expect(SuggestionMapper.toDomain(supabaseRow)).toEqual({
      id: 'sg-1',
      userId: 'author-1',
      userEmail: 'a@test.com',
      userName: 'Alex',
      category: 'teacher',
      title: 'Un titre',
      content: 'Contenu',
      likesCount: 5,
      createdAt: '2026-02-01T12:00:00.000Z',
    });
  });

  it('toDomain preserves null optional profile fields', () => {
    const row: SupabaseSuggestion = {
      ...supabaseRow,
      user_email: null,
      user_name: null,
    };
    const domain = SuggestionMapper.toDomain(row);
    expect(domain.userEmail).toBeNull();
    expect(domain.userName).toBeNull();
  });

  it('toLikesCount maps id and likes_count', () => {
    const row: SupabaseSuggestionLikesCount = {
      id: 'sg-2',
      likes_count: 12,
    };
    expect(SuggestionMapper.toLikesCount(row)).toEqual({
      id: 'sg-2',
      likesCount: 12,
    });
  });

  it('decrementLikeToSupabase floors at zero', () => {
    expect(SuggestionMapper.decrementLikeToSupabase(3)).toEqual({
      likes_count: 2,
    });
    expect(SuggestionMapper.decrementLikeToSupabase(0)).toEqual({
      likes_count: 0,
    });
  });

  it('incrementLikeToSupabase adds one', () => {
    expect(SuggestionMapper.incrementLikeToSupabase(4)).toEqual({
      likes_count: 5,
    });
    expect(SuggestionMapper.incrementLikeToSupabase(0)).toEqual({
      likes_count: 1,
    });
  });
});
