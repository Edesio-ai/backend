import { SuggestionMapper } from './suggestion.mapper';
import {
  SupabaseSuggestion,
  SupabaseUserLike,
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

  it('toUserLike maps suggestion_id to string id', () => {
    const row: SupabaseUserLike = { suggestion_id: 'liked-sg' };
    expect(SuggestionMapper.toUserLike(row)).toBe('liked-sg');
  });
});
