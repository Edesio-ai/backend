import { SuggestionSupabaseRepository } from './suggestion-supabase.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SupabaseSuggestion } from 'src/domain/suggestion/suggestion.type';
import { SuggestionMapper } from '../mappers/suggestion.mapper';

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

  describe('createSuggestion', () => {
    it('should insert, select row and return mapped suggestion', async () => {
      fixtures.whenInsertSingleSucceeds();

      const result = await fixtures.whenCreateSuggestion();

      fixtures.thenInsertSelectSingleChainBuilt();
      expect(result).toMatchObject({
        id: 'sg-new',
        userId: 'u-new',
        title: 'Hello',
        likesCount: 0,
      });
    });

    it('should throw ServerError when insert fails', async () => {
      fixtures.whenInsertSingleFails('violates constraint');

      const promise = fixtures.whenCreateSuggestion();

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('violates constraint');
    });
  });

  describe('getSuggestionById', () => {
    it('should return mapped suggestion when single succeeds', async () => {
      fixtures.whenGetByIdSingleSucceeds();

      const result = await fixtures.whenGetSuggestionById('sg-1');

      fixtures.thenGetSuggestionByIdChainBuilt('sg-1');
      expect(result).toMatchObject({
        id: 'sg-1',
        userId: 'u1',
        title: 'T',
        likesCount: 2,
      });
    });

    it('should throw ServerError when single fails', async () => {
      fixtures.whenGetByIdSingleFails('not found');

      const promise = fixtures.whenGetSuggestionById('missing');

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('not found');
    });
  });

  describe('deleteSuggestion', () => {
    it('should delete row by id when Supabase succeeds', async () => {
      fixtures.whenDeleteSucceeds();

      await fixtures.whenDeleteSuggestion('sg-9');

      fixtures.thenDeleteSuggestionChainBuilt('sg-9');
    });

    it('should throw ServerError when delete fails', async () => {
      fixtures.whenDeleteFails('rls violation');

      const promise = fixtures.whenDeleteSuggestion('sg-9');

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('rls violation');
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
  private readonly singleForGetByIdMock = jest.fn();
  private readonly eqStarSelectMock = jest.fn(
    (column: string, _value: string) => {
      if (column === 'category') {
        return { order: this.orderLikesMock };
      }
      if (column === 'id') {
        return { single: this.singleForGetByIdMock };
      }
      throw new Error(`unexpected eq after select *: ${column}`);
    },
  );

  private readonly singleMock = jest.fn();
  private readonly eqSuggestionIdForSingleMock = jest.fn(() => ({
    single: this.singleMock,
  }));

  private readonly eqSuggestionIdForUpdateMock = jest.fn();

  private readonly eqSuggestionIdForDeleteMock = jest.fn();
  private readonly deleteMock = jest.fn(() => ({
    eq: this.eqSuggestionIdForDeleteMock,
  }));

  private readonly selectSuggestionsMock = jest.fn((cols: string) => {
    if (cols === '*') {
      return { eq: this.eqStarSelectMock };
    }
    if (cols === 'id, likes_count') {
      return { eq: this.eqSuggestionIdForSingleMock };
    }
    throw new Error(`unexpected select ${cols}`);
  });

  private readonly updateMock = jest.fn(() => ({
    eq: this.eqSuggestionIdForUpdateMock,
  }));

  private readonly singleAfterInsertMock = jest.fn();
  private readonly selectAfterInsertMock = jest.fn(() => ({
    single: this.singleAfterInsertMock,
  }));
  private readonly insertSuggestionMock = jest.fn(() => ({
    select: this.selectAfterInsertMock,
  }));

  private readonly fromMock = jest.fn();

  public readonly repository: SuggestionSupabaseRepository;

  public readonly insertPayload = {
    userId: 'u-new',
    userEmail: 'n@test.com',
    userName: 'Noémie',
    category: 'teacher' as const,
    title: 'Hello',
    content: 'World content',
    likesCount: 0,
  };

  constructor() {
    this.fromMock.mockImplementation((table: string) => {
      if (table !== 'suggestions') {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: this.selectSuggestionsMock,
        update: this.updateMock,
        insert: this.insertSuggestionMock,
        delete: this.deleteMock,
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

  whenCreateSuggestion() {
    return this.repository.createSuggestion(this.insertPayload);
  }

  whenGetSuggestionById(id: string) {
    return this.repository.getSuggestionById(id);
  }

  whenDeleteSuggestion(id: string) {
    return this.repository.deleteSuggestion(id);
  }

  whenSuggestionsQuerySucceeds() {
    this.orderCreatedAtMock.mockResolvedValue({
      data: this.rows,
      error: null,
    });
  }

  whenInsertSingleSucceeds() {
    this.singleAfterInsertMock.mockResolvedValue({
      data: {
        id: 'sg-new',
        user_id: 'u-new',
        user_email: 'n@test.com',
        user_name: 'Noémie',
        category: 'teacher',
        title: 'Hello',
        content: 'World content',
        likes_count: 0,
        created_at: '2026-03-01T08:00:00.000Z',
      },
      error: null,
    });
  }

  whenInsertSingleFails(message: string) {
    this.singleAfterInsertMock.mockResolvedValue({
      data: null,
      error: { message },
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

  whenGetByIdSingleSucceeds() {
    this.singleForGetByIdMock.mockResolvedValue({
      data: this.rows[0],
      error: null,
    });
  }

  whenGetByIdSingleFails(message: string) {
    this.singleForGetByIdMock.mockResolvedValue({
      data: null,
      error: { message },
    });
  }

  whenDeleteSucceeds() {
    this.eqSuggestionIdForDeleteMock.mockResolvedValue({ error: null });
  }

  whenDeleteFails(message: string) {
    this.eqSuggestionIdForDeleteMock.mockResolvedValue({
      error: { message },
    });
  }

  thenSuggestionsQueryChainBuilt(category: string) {
    expect(this.fromMock).toHaveBeenCalledWith('suggestions');
    expect(this.selectSuggestionsMock).toHaveBeenCalledWith('*');
    expect(this.eqStarSelectMock).toHaveBeenCalledWith('category', category);
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

  thenInsertSelectSingleChainBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('suggestions');
    expect(this.insertSuggestionMock).toHaveBeenCalledWith(
      SuggestionMapper.toInsert(this.insertPayload),
    );
    expect(this.selectAfterInsertMock).toHaveBeenCalledTimes(1);
    expect(this.singleAfterInsertMock).toHaveBeenCalledTimes(1);
  }

  thenGetSuggestionByIdChainBuilt(suggestionId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('suggestions');
    expect(this.selectSuggestionsMock).toHaveBeenCalledWith('*');
    expect(this.eqStarSelectMock).toHaveBeenCalledWith('id', suggestionId);
    expect(this.singleForGetByIdMock).toHaveBeenCalledTimes(1);
  }

  thenDeleteSuggestionChainBuilt(suggestionId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('suggestions');
    expect(this.deleteMock).toHaveBeenCalledTimes(1);
    expect(this.eqSuggestionIdForDeleteMock).toHaveBeenCalledWith(
      'id',
      suggestionId,
    );
  }
}
