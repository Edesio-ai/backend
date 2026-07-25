import { SupabaseClient } from '@supabase/supabase-js';
import { SuggestionLikeSupabaseRepository } from './suggestion-like-supabase.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';

describe('SuggestionLikeSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('getUserLikes', () => {
    it('should return suggestion ids from rows', async () => {
      fixtures.whenListLikesSucceeds();

      const result = await fixtures.whenGetUserLikes('user-a', ['x', 'y']);

      fixtures.thenGetUserLikesChainBuilt('user-a', ['x', 'y']);
      expect(result).toEqual(['x']);
    });

    it('should return empty array when data is null', async () => {
      fixtures.whenListLikesReturnsNull();

      const result = await fixtures.whenGetUserLikes('user-b', []);

      expect(result).toEqual([]);
    });
  });

  describe('getSuggestionLikeByUserAndSuggestionId', () => {
    it('should return like row id when present', async () => {
      fixtures.whenMaybeSingleReturnsRow({ id: 'like-1' });

      const result = await fixtures.whenGetLikeByPair('user-1', 'sg-1');

      fixtures.thenMaybeSingleChainBuilt('user-1', 'sg-1');
      expect(result).toBe('like-1');
    });

    it('should return null when no row', async () => {
      fixtures.whenMaybeSingleReturnsRow(null);

      const result = await fixtures.whenGetLikeByPair('user-1', 'sg-1');

      expect(result).toBeNull();
    });

    it('should throw ServerError when Supabase returns error', async () => {
      fixtures.whenMaybeSingleFails('rpc failed');

      const promise = fixtures.whenGetLikeByPair('user-1', 'sg-1');

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('rpc failed');
    });
  });

  describe('deleteSuggestionLikeById', () => {
    it('should resolve when delete succeeds', async () => {
      fixtures.whenDeleteSucceeds();

      await fixtures.whenDeleteLike('like-9');

      fixtures.thenDeleteChainBuilt('like-9');
    });

    it('should throw ServerError when delete fails', async () => {
      fixtures.whenDeleteFails('constraint');

      const promise = fixtures.whenDeleteLike('like-9');

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('constraint');
    });
  });

  describe('createSuggestionLike', () => {
    it('should insert mapped payload', async () => {
      fixtures.whenInsertSucceeds();

      await fixtures.whenCreateLike('sg-2', 'user-z');

      fixtures.thenInsertChainBuilt('sg-2', 'user-z');
    });

    it('should throw ServerError when insert fails', async () => {
      fixtures.whenInsertFails('duplicate');

      const promise = fixtures.whenCreateLike('sg-2', 'user-z');

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('duplicate');
    });
  });
});

class Fixtures {
  private readonly inSuggestionIdsMock = jest.fn();
  private readonly eqLikeUserMock = jest.fn(() => ({
    in: this.inSuggestionIdsMock,
  }));

  private readonly maybeSingleMock = jest.fn();
  private readonly eqSuggestionPairMock = jest.fn(() => ({
    maybeSingle: this.maybeSingleMock,
  }));
  private readonly eqLikeUserForPairMock = jest.fn(() => ({
    eq: this.eqSuggestionPairMock,
  }));

  private readonly selectLikesMock = jest.fn((cols: string) => {
    if (cols === 'suggestion_id') {
      return { eq: this.eqLikeUserMock };
    }
    if (cols === 'id') {
      return { eq: this.eqLikeUserForPairMock };
    }
    throw new Error(`unexpected select ${cols}`);
  });

  private readonly eqDeleteLikeIdMock = jest.fn();
  private readonly deleteLikeMock = jest.fn(() => ({
    eq: this.eqDeleteLikeIdMock,
  }));

  private readonly insertLikeMock = jest.fn();

  private readonly fromMock = jest.fn();

  public readonly repository: SuggestionLikeSupabaseRepository;

  constructor() {
    this.fromMock.mockImplementation((table: string) => {
      if (table === 'suggestion_likes') {
        return {
          select: this.selectLikesMock,
          delete: this.deleteLikeMock,
          insert: this.insertLikeMock,
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    this.repository = new SuggestionLikeSupabaseRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenGetUserLikes(userId: string, ids: string[]) {
    return this.repository.getUserLikes(userId, ids);
  }

  whenGetLikeByPair(userId: string, suggestionId: string) {
    return this.repository.getSuggestionLikeByUserAndSuggestionId(userId, suggestionId);
  }

  whenDeleteLike(likeId: string) {
    return this.repository.deleteSuggestionLikeById(likeId);
  }

  whenCreateLike(suggestionId: string, userId: string) {
    return this.repository.createSuggestionLike(suggestionId, userId);
  }

  whenListLikesSucceeds() {
    this.inSuggestionIdsMock.mockResolvedValue({
      data: [{ suggestion_id: 'x' }],
      error: null,
    });
  }

  whenListLikesReturnsNull() {
    this.inSuggestionIdsMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenMaybeSingleReturnsRow(row: { id: string } | null) {
    this.maybeSingleMock.mockResolvedValue({
      data: row,
      error: null,
    });
  }

  whenMaybeSingleFails(message: string) {
    this.maybeSingleMock.mockResolvedValue({
      data: null,
      error: { message },
    });
  }

  whenDeleteSucceeds() {
    this.eqDeleteLikeIdMock.mockResolvedValue({ error: null });
  }

  whenDeleteFails(message: string) {
    this.eqDeleteLikeIdMock.mockResolvedValue({
      error: { message },
    });
  }

  whenInsertSucceeds() {
    this.insertLikeMock.mockResolvedValue({ error: null });
  }

  whenInsertFails(message: string) {
    this.insertLikeMock.mockResolvedValue({
      error: { message },
    });
  }

  thenGetUserLikesChainBuilt(userId: string, ids: string[]) {
    expect(this.fromMock).toHaveBeenCalledWith('suggestion_likes');
    expect(this.selectLikesMock).toHaveBeenCalledWith('suggestion_id');
    expect(this.eqLikeUserMock).toHaveBeenCalledWith('user_id', userId);
    expect(this.inSuggestionIdsMock).toHaveBeenCalledWith('suggestion_id', ids);
  }

  thenMaybeSingleChainBuilt(userId: string, suggestionId: string) {
    expect(this.selectLikesMock).toHaveBeenCalledWith('id');
    expect(this.eqLikeUserForPairMock).toHaveBeenCalledWith('user_id', userId);
    expect(this.eqSuggestionPairMock).toHaveBeenCalledWith('suggestion_id', suggestionId);
    expect(this.maybeSingleMock).toHaveBeenCalledTimes(1);
  }

  thenDeleteChainBuilt(likeId: string) {
    expect(this.deleteLikeMock).toHaveBeenCalledTimes(1);
    expect(this.eqDeleteLikeIdMock).toHaveBeenCalledWith('id', likeId);
  }

  thenInsertChainBuilt(suggestionId: string, userId: string) {
    expect(this.insertLikeMock).toHaveBeenCalledWith({
      suggestion_id: suggestionId,
      user_id: userId,
    });
  }
}
