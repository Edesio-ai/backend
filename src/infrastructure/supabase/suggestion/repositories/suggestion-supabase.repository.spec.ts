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

  describe('getSuggestionLikesCountById', () => {
    it('should return mapped id and likesCount', async () => {
      fixtures.whenLikesCountSingleSucceeds();

      const result = await fixtures.whenGetSuggestionLikesCountById('sg-1');

      fixtures.thenLikesCountQueryBuilt('sg-1');
      expect(result).toEqual({ id: 'sg-1', likesCount: 7 });
    });

    it('should throw ServerError when single fails', async () => {
      fixtures.whenLikesCountSingleFails('not found');

      const promise = fixtures.whenGetSuggestionLikesCountById('missing');

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('not found');
    });
  });

  describe('decrementLike', () => {
    it('should update suggestions row with decremented count', async () => {
      fixtures.whenUpdateSucceeds();

      await fixtures.whenDecrementLike('sg-1', 5);

      fixtures.thenUpdateLikeBuilt('sg-1', { likes_count: 4 });
    });

    it('should throw ServerError when update fails', async () => {
      fixtures.whenUpdateFails('write failed');

      const promise = fixtures.whenDecrementLike('sg-1', 2);

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('write failed');
    });
  });

  describe('incrementLike', () => {
    it('should update suggestions row with incremented count', async () => {
      fixtures.whenUpdateSucceeds();

      await fixtures.whenIncrementLike('sg-1', 3);

      fixtures.thenUpdateLikeBuilt('sg-1', { likes_count: 4 });
    });

    it('should throw ServerError when update fails', async () => {
      fixtures.whenUpdateFails('conflict');

      const promise = fixtures.whenIncrementLike('sg-1', 1);

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('conflict');
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

  private readonly singleMock = jest.fn();
  private readonly eqSuggestionIdForSingleMock = jest.fn(() => ({
    single: this.singleMock,
  }));

  private readonly eqSuggestionIdForUpdateMock = jest.fn();

  private readonly selectSuggestionsMock = jest.fn((cols: string) => {
    if (cols === '*') {
      return { eq: this.eqCategoryMock };
    }
    if (cols === 'id, likes_count') {
      return { eq: this.eqSuggestionIdForSingleMock };
    }
    throw new Error(`unexpected select ${cols}`);
  });

  private readonly updateMock = jest.fn(() => ({
    eq: this.eqSuggestionIdForUpdateMock,
  }));

  private readonly fromMock = jest.fn();

  public readonly repository: SuggestionSupabaseRepository;

  constructor() {
    this.fromMock.mockImplementation((table: string) => {
      if (table !== 'suggestions') {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: this.selectSuggestionsMock,
        update: this.updateMock,
      };
    });

    const supabaseMock = { from: this.fromMock };
    this.repository = new SuggestionSupabaseRepository(supabaseMock as any);
  }

  whenGetSuggestions(category: string) {
    return this.repository.getSuggestions(category);
  }

  whenGetSuggestionLikesCountById(id: string) {
    return this.repository.getSuggestionLikesCountById(id);
  }

  whenDecrementLike(suggestionId: string, likesCount: number) {
    return this.repository.decrementLike(suggestionId, likesCount);
  }

  whenIncrementLike(suggestionId: string, likesCount: number) {
    return this.repository.incrementLike(suggestionId, likesCount);
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

  whenLikesCountSingleSucceeds() {
    this.singleMock.mockResolvedValue({
      data: { id: 'sg-1', likes_count: 7 },
      error: null,
    });
  }

  whenLikesCountSingleFails(message: string) {
    this.singleMock.mockResolvedValue({
      data: null,
      error: { message },
    });
  }

  whenUpdateSucceeds() {
    this.eqSuggestionIdForUpdateMock.mockResolvedValue({ error: null });
  }

  whenUpdateFails(message: string) {
    this.eqSuggestionIdForUpdateMock.mockResolvedValue({
      error: { message },
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

  thenLikesCountQueryBuilt(suggestionId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('suggestions');
    expect(this.selectSuggestionsMock).toHaveBeenCalledWith('id, likes_count');
    expect(this.eqSuggestionIdForSingleMock).toHaveBeenCalledWith(
      'id',
      suggestionId,
    );
    expect(this.singleMock).toHaveBeenCalledTimes(1);
  }

  thenUpdateLikeBuilt(suggestionId: string, payload: { likes_count: number }) {
    expect(this.updateMock).toHaveBeenCalledWith(payload);
    expect(this.eqSuggestionIdForUpdateMock).toHaveBeenCalledWith(
      'id',
      suggestionId,
    );
  }
}
