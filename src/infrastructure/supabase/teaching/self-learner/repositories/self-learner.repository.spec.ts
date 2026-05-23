import { SupabaseClient } from '@supabase/supabase-js';
import { SelfLearnerRepository } from './self-learner.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SelfLearnerMapper } from '../mappers/self-learner.mapper';
import type { SelfLearnerToInsert } from 'src/domain/teaching/self-learner/types/self-learner.type';

describe('SelfLearnerRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('getSelfLearnerByUserId', () => {
    it('returns mapped self-learner when row exists', async () => {
      fixtures.whenMaybeSingleReturnsRow();

      const result = await fixtures.whenGetByUserId();

      expect(result).toEqual(fixtures.expectedDomain);
      fixtures.thenGetByUserIdChainBuilt();
    });

    it('returns null when no row', async () => {
      fixtures.whenMaybeSingleReturnsNull();

      const result = await fixtures.whenGetByUserId();

      expect(result).toBeNull();
      fixtures.thenGetByUserIdChainBuilt();
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenMaybeSingleFails('db error');

      await expect(fixtures.whenGetByUserId()).rejects.toBeInstanceOf(
        ServerError,
      );
    });
  });

  describe('createSelfLearner', () => {
    it('inserts mapped payload and returns domain row', async () => {
      fixtures.whenInsertSingleSucceeds();

      const result = await fixtures.whenCreate();

      expect(result).toEqual(fixtures.expectedDomain);
      expect(fixtures.insertMock).toHaveBeenCalledWith(
        SelfLearnerMapper.toInsert(fixtures.insertPayload),
      );
      expect(fixtures.selectAfterInsertMock).toHaveBeenCalledTimes(1);
      expect(fixtures.singleAfterInsertMock).toHaveBeenCalledTimes(1);
    });

    it('throws ServerError when insert fails', async () => {
      fixtures.whenInsertSingleFails('unique violation');

      await expect(fixtures.whenCreate()).rejects.toBeInstanceOf(ServerError);
    });
  });
});

class Fixtures {
  public readonly userId = 'user-sl-1';

  public readonly supabaseRow = {
    id: 'sl-1',
    supabase_user_id: this.userId,
    name: 'Jean Dupont',
    email: 'j@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedDomain = {
    id: 'sl-1',
    supabaseUserId: this.userId,
    name: 'Jean Dupont',
    email: 'j@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly insertPayload: SelfLearnerToInsert = {
    supabaseUserId: this.userId,
    name: 'Jean Dupont',
    email: 'j@school.com',
  };

  public readonly fromMock = jest.fn();
  public readonly maybeSingleMock = jest.fn();
  public readonly eqMock = jest.fn();
  public readonly selectMock = jest.fn();

  public readonly insertMock = jest.fn();
  public readonly selectAfterInsertMock = jest.fn();
  public readonly singleAfterInsertMock = jest.fn();

  public readonly repository: SelfLearnerRepository;

  constructor() {
    this.fromMock.mockImplementation((table: string) => {
      if (table !== 'self_learners') {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: this.selectMock,
        insert: this.insertMock,
      };
    });

    const supabase = { from: this.fromMock } as unknown as SupabaseClient;
    this.repository = new SelfLearnerRepository(supabase);
  }

  whenGetByUserId() {
    return this.repository.getSelfLearnerByUserId(this.userId);
  }

  whenCreate() {
    return this.repository.createSelfLearner(this.insertPayload);
  }

  whenMaybeSingleReturnsRow() {
    this.maybeSingleMock.mockResolvedValue({
      data: this.supabaseRow,
      error: null,
    });
    this.eqMock.mockReturnValue({ maybeSingle: this.maybeSingleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
  }

  whenMaybeSingleReturnsNull() {
    this.maybeSingleMock.mockResolvedValue({ data: null, error: null });
    this.eqMock.mockReturnValue({ maybeSingle: this.maybeSingleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
  }

  whenMaybeSingleFails(message: string) {
    this.maybeSingleMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.eqMock.mockReturnValue({ maybeSingle: this.maybeSingleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
  }

  whenInsertSingleSucceeds() {
    this.singleAfterInsertMock.mockResolvedValue({
      data: this.supabaseRow,
      error: null,
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterInsertMock,
    });
    this.insertMock.mockReturnValue({ select: this.selectAfterInsertMock });
  }

  whenInsertSingleFails(message: string) {
    this.singleAfterInsertMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterInsertMock,
    });
    this.insertMock.mockReturnValue({ select: this.selectAfterInsertMock });
  }

  thenGetByUserIdChainBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('self_learners');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('supabase_user_id', this.userId);
    expect(this.maybeSingleMock).toHaveBeenCalledTimes(1);
  }
}
