import { SuggestionSupabaseRepository } from './suggestion-supabase.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SupabaseSuggestion } from 'src/domain/suggestion/suggestion.type';

describe('SuggestionSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('getSuggestions', () => {
    it('should return mapped suggestions when query succeeds', async () => {
      fixtures.whenSuggestionsQuerySucceeds();

      const result = await fixtures.whenGetSuggestions('teacher');

      fixtures.thenSuggestionsQueryChainBuilt('teacher');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'sg-1',
        userId: 'u1',
        category: 'teacher',
        title: 'T',
        likesCount: 2,
      });
    });

    it('should return empty array when data is null', async () => {
      fixtures.whenSuggestionsQueryReturnsNullData();

      const result = await fixtures.whenGetSuggestions('student');

      expect(result).toEqual([]);
    });

    it('should throw ServerError when Supabase returns error', async () => {
      fixtures.whenSuggestionsQueryFails('permission denied');

      const promise = fixtures.whenGetSuggestions('teacher');

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('permission denied');
    });
  });

  describe('getUserLikes', () => {
    it('should return suggestion ids from likes rows', async () => {
      fixtures.whenLikesQuerySucceeds();

      const result = await fixtures.whenGetUserLikes('user-a', ['x', 'y']);

      fixtures.thenLikesQueryChainBuilt('user-a', ['x', 'y']);
      expect(result).toEqual(['x']);
    });

    it('should return empty array when data is null', async () => {
      fixtures.whenLikesQueryReturnsNullData();

      const result = await fixtures.whenGetUserLikes('user-b', ['z']);

      expect(result).toEqual([]);
    });
  });
});

class Fixtures {
  public readonly rows: SupabaseSuggestion[] = [
    {
      id: 'sg-1',
      user_id: 'u1',
      user_email: null,
      user_name: null,
      category: 'teacher',
      title: 'T',
      content: 'C',
      likes_count: 2,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  private readonly orderCreatedAtMock = jest.fn();
  private readonly orderLikesMock = jest.fn(() => ({
    order: this.orderCreatedAtMock,
  }));
  private readonly eqCategoryMock = jest.fn(() => ({
    order: this.orderLikesMock,
  }));
  private readonly selectSuggestionsMock = jest.fn(() => ({
    eq: this.eqCategoryMock,
  }));

  private readonly inMock = jest.fn();
  private readonly eqUserMock = jest.fn(() => ({ in: this.inMock }));
  private readonly selectLikesMock = jest.fn(() => ({ eq: this.eqUserMock }));

  private readonly fromMock = jest.fn();

  public readonly repository: SuggestionSupabaseRepository;

  constructor() {
    this.fromMock.mockImplementation((table: string) => {
      if (table === 'suggestions') {
        return { select: this.selectSuggestionsMock };
      }
      if (table === 'suggestion_likes') {
        return { select: this.selectLikesMock };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const supabaseMock = { from: this.fromMock };
    this.repository = new SuggestionSupabaseRepository(supabaseMock as any);
  }

  whenGetSuggestions(category: string) {
    return this.repository.getSuggestions(category);
  }

  whenGetUserLikes(userId: string, ids: string[]) {
    return this.repository.getUserLikes(userId, ids);
  }

  whenSuggestionsQuerySucceeds() {
    this.orderCreatedAtMock.mockResolvedValue({
      data: this.rows,
      error: null,
    });
  }

  whenSuggestionsQueryReturnsNullData() {
    this.orderCreatedAtMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenSuggestionsQueryFails(message: string) {
    this.orderCreatedAtMock.mockResolvedValue({
      data: null,
      error: { message },
    });
  }

  whenLikesQuerySucceeds() {
    this.inMock.mockResolvedValue({
      data: [{ suggestion_id: 'x' }],
      error: null,
    });
  }

  whenLikesQueryReturnsNullData() {
    this.inMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  thenSuggestionsQueryChainBuilt(category: string) {
    expect(this.fromMock).toHaveBeenCalledWith('suggestions');
    expect(this.selectSuggestionsMock).toHaveBeenCalledWith('*');
    expect(this.eqCategoryMock).toHaveBeenCalledWith('category', category);
    expect(this.orderLikesMock).toHaveBeenCalledWith('likes_count', {
      ascending: false,
    });
    expect(this.orderCreatedAtMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  }

  thenLikesQueryChainBuilt(userId: string, ids: string[]) {
    expect(this.fromMock).toHaveBeenCalledWith('suggestion_likes');
    expect(this.selectLikesMock).toHaveBeenCalledWith('suggestion_id');
    expect(this.eqUserMock).toHaveBeenCalledWith('user_id', userId);
    expect(this.inMock).toHaveBeenCalledWith('suggestion_id', ids);
  }
}
