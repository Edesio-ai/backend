import { SupabaseClient } from '@supabase/supabase-js';
import { SelfLearnerCourseRepository } from './self-learner-course.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SelfLearnerCourseMapper } from '../mappers/self-learner-course.use-case';

describe('SelfLearnerCourseRepository', () => {
  describe('getSelfLearnerCourses', () => {
    let fixtures: ListFixtures;

    beforeEach(() => {
      fixtures = new ListFixtures();
    });

    it('maps rows when query succeeds', async () => {
      fixtures.whenQuerySucceedsWithRows([fixtures.supabaseRows[0]]);

      const result = await fixtures.whenGetCourses();

      fixtures.thenListChainBuilt(fixtures.selfLearnerId);
      expect(result).toEqual([
        SelfLearnerCourseMapper.toDomain(fixtures.supabaseRows[0]),
      ]);
    });

    it('returns empty array when data is null', async () => {
      fixtures.whenQueryReturnsNull();

      const result = await fixtures.whenGetCourses();

      expect(result).toEqual([]);
      fixtures.thenListChainBuilt(fixtures.selfLearnerId);
    });

    it('throws ServerError when Supabase returns error', async () => {
      fixtures.whenQueryFails('permission denied');

      await expect(fixtures.whenGetCourses()).rejects.toBeInstanceOf(
        ServerError,
      );
    });
  });

  describe('getSelfLearnerCoursesCount', () => {
    let fixtures: CountFixtures;

    beforeEach(() => {
      fixtures = new CountFixtures();
    });

    it('returns count from Supabase response', async () => {
      fixtures.whenCountReturns(14);

      const result = await fixtures.whenCount();

      expect(result).toBe(14);
      fixtures.thenCountChainBuilt(fixtures.selfLearnerId);
    });

    it('returns zero when count is null', async () => {
      fixtures.whenCountReturnsNull();

      await expect(fixtures.whenCount()).resolves.toBe(0);
    });

    it('throws ServerError when count query fails', async () => {
      fixtures.whenCountFails('rls');

      await expect(fixtures.whenCount()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('createSelfLearnerCourse', () => {
    let fixtures: CreateFixtures;

    beforeEach(() => {
      fixtures = new CreateFixtures();
    });

    it('inserts mapped payload and returns domain row', async () => {
      fixtures.whenInsertSucceeds();

      const result = await fixtures.whenCreate();

      expect(result).toEqual(
        SelfLearnerCourseMapper.toDomain(fixtures.supabaseRow),
      );
      expect(fixtures.insertMock).toHaveBeenCalledWith(
        SelfLearnerCourseMapper.toInsert(fixtures.payload),
      );
      expect(fixtures.singleAfterInsertMock).toHaveBeenCalledTimes(1);
    });

    it('throws ServerError when insert fails', async () => {
      fixtures.whenInsertFails('violates FK');

      await expect(fixtures.whenCreate()).rejects.toBeInstanceOf(ServerError);
    });
  });
});

class ListFixtures {
  public readonly selfLearnerId = 'sl-abc';

  public readonly supabaseRows = [
    {
      id: 'c-1',
      self_learner_id: this.selfLearnerId,
      title: 'Course A',
      description: null,
      text_content: null,
      language: 'francais' as const,
      created_at: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'c-2',
      self_learner_id: this.selfLearnerId,
      title: 'Course B',
      description: null,
      text_content: null,
      language: 'espagnol' as const,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  public readonly fromMock = jest.fn();
  public readonly selectMock = jest.fn();
  public readonly eqMock = jest.fn();
  public readonly orderMock = jest.fn();

  public readonly repository: SelfLearnerCourseRepository;

  constructor() {
    this.repository = new SelfLearnerCourseRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenGetCourses() {
    return this.repository.getSelfLearnerCourses(this.selfLearnerId);
  }

  whenQuerySucceedsWithRows(rows: typeof this.supabaseRows) {
    this.orderMock.mockResolvedValue({
      data: rows,
      error: null,
    });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenQueryReturnsNull() {
    this.orderMock.mockResolvedValue({
      data: null,
      error: null,
    });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenQueryFails(message: string) {
    this.orderMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  thenListChainBuilt(selfLearnerId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('self_learner_courses');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('self_learner_id', selfLearnerId);
    expect(this.orderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  }
}

class CountFixtures {
  public readonly selfLearnerId = 'sl-count';

  public readonly fromMock = jest.fn();
  public readonly selectMock = jest.fn();
  public readonly eqMock = jest.fn();

  public readonly repository: SelfLearnerCourseRepository;

  constructor() {
    this.repository = new SelfLearnerCourseRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenCount() {
    return this.repository.getSelfLearnerCoursesCount(this.selfLearnerId);
  }

  whenCountReturns(n: number) {
    this.eqMock.mockResolvedValue({
      count: n,
      data: null,
      error: null,
    });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenCountReturnsNull() {
    this.eqMock.mockResolvedValue({
      count: null,
      data: null,
      error: null,
    });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenCountFails(message: string) {
    this.eqMock.mockResolvedValue({
      count: null,
      data: null,
      error: { message },
    });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  thenCountChainBuilt(selfLearnerId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('self_learner_courses');
    expect(this.selectMock).toHaveBeenCalledWith('*', {
      count: 'exact',
      head: true,
    });
    expect(this.eqMock).toHaveBeenCalledWith('self_learner_id', selfLearnerId);
  }
}

class CreateFixtures {
  public readonly payload = {
    selfLearnerId: 'sl-1',
    title: 'TC',
    description: null as string | null,
    textContent: null as string | null,
    language: 'allemand' as const,
  };

  public readonly supabaseRow = {
    id: 'c-new',
    self_learner_id: this.payload.selfLearnerId,
    title: this.payload.title,
    description: this.payload.description,
    text_content: this.payload.textContent,
    language: this.payload.language,
    created_at: '2026-01-03T00:00:00.000Z',
  };

  public readonly fromMock = jest.fn();
  public readonly insertMock = jest.fn();
  public readonly selectAfterInsertMock = jest.fn();
  public readonly singleAfterInsertMock = jest.fn();

  public readonly repository: SelfLearnerCourseRepository;

  constructor() {
    this.repository = new SelfLearnerCourseRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenCreate() {
    return this.repository.createSelfLearnerCourse(this.payload);
  }

  whenInsertSucceeds() {
    this.singleAfterInsertMock.mockResolvedValue({
      data: this.supabaseRow,
      error: null,
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterInsertMock,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }

  whenInsertFails(message: string) {
    this.singleAfterInsertMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterInsertMock,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }
}
