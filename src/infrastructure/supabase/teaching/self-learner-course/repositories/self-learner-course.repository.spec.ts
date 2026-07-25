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
      expect(result).toEqual([SelfLearnerCourseMapper.toDomain(fixtures.supabaseRows[0])]);
    });

    it('returns empty array when data is null', async () => {
      fixtures.whenQueryReturnsNull();

      const result = await fixtures.whenGetCourses();

      expect(result).toEqual([]);
      fixtures.thenListChainBuilt(fixtures.selfLearnerId);
    });

    it('throws ServerError when Supabase returns error', async () => {
      fixtures.whenQueryFails('permission denied');

      await expect(fixtures.whenGetCourses()).rejects.toBeInstanceOf(ServerError);
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

      expect(result).toEqual(SelfLearnerCourseMapper.toDomain(fixtures.supabaseRow));
      expect(fixtures.insertMock).toHaveBeenCalledWith(SelfLearnerCourseMapper.toInsert(fixtures.payload));
      expect(fixtures.singleAfterInsertMock).toHaveBeenCalledTimes(1);
    });

    it('throws ServerError when insert fails', async () => {
      fixtures.whenInsertFails('violates FK');

      await expect(fixtures.whenCreate()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('getSelfLearnerCourseById', () => {
    let fixtures: GetByIdFixtures;

    beforeEach(() => {
      fixtures = new GetByIdFixtures();
    });

    it('returns mapped course when single succeeds', async () => {
      fixtures.whenSingleReturnsRow();

      const result = await fixtures.whenGetById();

      fixtures.thenGetByIdChainBuilt(fixtures.courseId);
      expect(result).toEqual(SelfLearnerCourseMapper.toDomain(fixtures.row));
    });

    it('returns null when data is null without error', async () => {
      fixtures.whenSingleReturnsEmpty();

      await expect(fixtures.whenGetById()).resolves.toBeNull();
    });

    it('throws ServerError when Supabase reports error', async () => {
      fixtures.whenSingleFails('no rows');

      await expect(fixtures.whenGetById()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('updateSelfLearnerCourse', () => {
    let fixtures: UpdateFixtures;

    beforeEach(() => {
      fixtures = new UpdateFixtures();
    });

    it('runs update mapped payload then returns domain row', async () => {
      fixtures.whenUpdateSucceeds();

      const result = await fixtures.whenUpdate();

      expect(fixtures.updateMock).toHaveBeenCalledWith(SelfLearnerCourseMapper.toUpdate(fixtures.patch));
      expect(fixtures.eqAfterUpdateMock).toHaveBeenCalledWith('id', fixtures.courseId);
      expect(fixtures.singleAfterUpdateMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(SelfLearnerCourseMapper.toDomain(fixtures.updatedRow));
    });

    it('throws ServerError when Supabase rejects update', async () => {
      fixtures.whenUpdateFails('rls');

      await expect(fixtures.whenUpdate()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('deleteSelfLearnerCourse', () => {
    let fixtures: DeleteCourseFixtures;

    beforeEach(() => {
      fixtures = new DeleteCourseFixtures();
    });

    it('deletes row scoped by course id', async () => {
      fixtures.whenDeleteSucceeds();

      await fixtures.whenDeleteCourse();

      expect(fixtures.fromMock).toHaveBeenCalledWith('self_learner_courses');
      expect(fixtures.deleteMock).toHaveBeenCalledTimes(1);
      expect(fixtures.eqAfterDeleteMock).toHaveBeenCalledWith('id', fixtures.courseId);
    });

    it('throws ServerError when Supabase rejects delete', async () => {
      fixtures.whenDeleteFails('rls');

      await expect(fixtures.whenDeleteCourse()).rejects.toBeInstanceOf(ServerError);
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

class UpdateFixtures {
  public readonly courseId = 'c-up';

  public readonly patch = {
    title: 'Revised',
    description: 'nouvelle',
    textContent: 'texte',
  };

  public readonly updatedRow = {
    id: this.courseId,
    self_learner_id: 'sl-1',
    title: this.patch.title,
    description: this.patch.description,
    text_content: this.patch.textContent,
    language: 'francais' as const,
    created_at: '2026-01-04T00:00:00.000Z',
  };

  public readonly fromMock = jest.fn();
  public readonly updateMock = jest.fn();
  public readonly eqAfterUpdateMock = jest.fn();
  public readonly selectAfterUpdateMock = jest.fn();
  public readonly singleAfterUpdateMock = jest.fn();

  public readonly repository: SelfLearnerCourseRepository;

  constructor() {
    this.repository = new SelfLearnerCourseRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenUpdate() {
    return this.repository.updateSelfLearnerCourse(this.courseId, this.patch);
  }

  whenUpdateSucceeds() {
    this.singleAfterUpdateMock.mockResolvedValue({
      data: this.updatedRow,
      error: null,
    });
    this.selectAfterUpdateMock.mockReturnValue({
      single: this.singleAfterUpdateMock,
    });
    this.eqAfterUpdateMock.mockReturnValue({
      select: this.selectAfterUpdateMock,
    });
    this.updateMock.mockReturnValue({ eq: this.eqAfterUpdateMock });
    this.fromMock.mockReturnValue({ update: this.updateMock });
  }

  whenUpdateFails(message: string) {
    this.singleAfterUpdateMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.selectAfterUpdateMock.mockReturnValue({
      single: this.singleAfterUpdateMock,
    });
    this.eqAfterUpdateMock.mockReturnValue({
      select: this.selectAfterUpdateMock,
    });
    this.updateMock.mockReturnValue({ eq: this.eqAfterUpdateMock });
    this.fromMock.mockReturnValue({ update: this.updateMock });
  }
}

class GetByIdFixtures {
  public readonly courseId = 'course-by-id';

  public readonly row = {
    id: this.courseId,
    self_learner_id: 'sl-99',
    title: 'T',
    description: null,
    text_content: null,
    language: 'francais' as const,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly fromMock = jest.fn();
  public readonly selectMock = jest.fn();
  public readonly eqMock = jest.fn();
  public readonly singleMock = jest.fn();

  public readonly repository: SelfLearnerCourseRepository;

  constructor() {
    this.repository = new SelfLearnerCourseRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenGetById() {
    return this.repository.getSelfLearnerCourseById(this.courseId);
  }

  whenSingleReturnsRow() {
    this.singleMock.mockResolvedValue({
      data: this.row,
      error: null,
    });
    this.eqMock.mockReturnValue({ single: this.singleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenSingleReturnsEmpty() {
    this.singleMock.mockResolvedValue({
      data: null,
      error: null,
    });
    this.eqMock.mockReturnValue({ single: this.singleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenSingleFails(message: string) {
    this.singleMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.eqMock.mockReturnValue({ single: this.singleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  thenGetByIdChainBuilt(courseId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('self_learner_courses');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('id', courseId);
    expect(this.singleMock).toHaveBeenCalledTimes(1);
  }
}

class DeleteCourseFixtures {
  public readonly courseId = 'c-del-repo';

  public readonly fromMock = jest.fn();
  public readonly deleteMock = jest.fn();
  public readonly eqAfterDeleteMock = jest.fn();

  public readonly repository: SelfLearnerCourseRepository;

  constructor() {
    this.repository = new SelfLearnerCourseRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenDeleteCourse() {
    return this.repository.deleteSelfLearnerCourse(this.courseId);
  }

  whenDeleteSucceeds() {
    this.eqAfterDeleteMock.mockResolvedValue({ error: null });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }

  whenDeleteFails(message: string) {
    this.eqAfterDeleteMock.mockResolvedValue({
      error: { message },
    });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }
}
