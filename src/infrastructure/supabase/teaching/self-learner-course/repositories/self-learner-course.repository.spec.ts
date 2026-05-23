import { SupabaseClient } from '@supabase/supabase-js';
import { SelfLearnerCourseRepository } from './self-learner-course.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SelfLearnerCourseMapper } from '../mappers/self-learner-course.use-case';

describe('SelfLearnerCourseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('maps rows when query succeeds', async () => {
    fixtures.whenQuerySucceedsWithRows([fixtures.supabaseRows[0]]);

    const result = await fixtures.whenGetCourses();

    fixtures.thenChainBuilt(fixtures.selfLearnerId);
    expect(result).toEqual([
      SelfLearnerCourseMapper.toDomain(fixtures.supabaseRows[0]),
    ]);
  });

  it('returns empty array when data is null', async () => {
    fixtures.whenQueryReturnsNull();

    const result = await fixtures.whenGetCourses();

    expect(result).toEqual([]);
    fixtures.thenChainBuilt(fixtures.selfLearnerId);
  });

  it('throws ServerError when Supabase returns error', async () => {
    fixtures.whenQueryFails('permission denied');

    await expect(fixtures.whenGetCourses()).rejects.toBeInstanceOf(ServerError);
  });
});

class Fixtures {
  public readonly selfLearnerId = 'sl-abc';

  public readonly supabaseRows = [
    {
      id: 'c-1',
      self_learner_id: this.selfLearnerId,
      name: 'Course A',
      email: '',
      created_at: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'c-2',
      self_learner_id: this.selfLearnerId,
      name: 'Course B',
      email: '',
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

  thenChainBuilt(selfLearnerId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('self_learner_courses');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('self_learner_id', selfLearnerId);
    expect(this.orderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  }
}
