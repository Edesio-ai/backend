import { SessionServerError } from '../../../../domain/teaching/error';
import { SupabaseSessionRepository } from './session-supabase.repository';

describe('SupabaseSessionRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return sessions for teacher id', async () => {
    fixtures.whenSessionsQuerySucceeds();

    const result = await fixtures.whenGetSessionsByTeacherId();

    fixtures.thenQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedSessions(result);
  });

  it('should throw SessionServerError when query fails', async () => {
    fixtures.whenSessionsQueryFails();

    const promise = fixtures.whenGetSessionsByTeacherId();

    await fixtures.thenThrowSessionServerError(promise);
    fixtures.thenQueryBuiltWithExpectedArguments();
  });
});

class Fixtures {
  public readonly teacherId = 'teacher-1';
  public readonly sessions = [
    {
      id: 'session-1',
      teacher_id: this.teacherId,
      nom: 'Cours 1',
      code: 'ABCD',
      langue: 'francais',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  private readonly orderMock = jest.fn();
  private readonly eqMock = jest.fn(() => ({ order: this.orderMock }));
  private readonly selectMock = jest.fn(() => ({ eq: this.eqMock }));
  private readonly fromMock = jest.fn(() => ({ select: this.selectMock }));

  public readonly repository: SupabaseSessionRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new SupabaseSessionRepository(supabaseMock as any);
  }

  whenGetSessionsByTeacherId() {
    return this.repository.getSessionsByTeacherId(this.teacherId);
  }

  whenSessionsQuerySucceeds() {
    this.orderMock.mockResolvedValue({
      data: this.sessions,
      error: null,
    });
  }

  whenSessionsQueryFails() {
    this.orderMock.mockResolvedValue({
      data: null,
      error: { message: 'sessions query failed' },
    });
  }

  async thenThrowSessionServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(SessionServerError);
  }

  thenQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('teacher_id', this.teacherId);
    expect(this.orderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(this.orderMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedSessions(result: unknown) {
    expect(result).toEqual(this.sessions);
  }
}
