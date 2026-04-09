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

  it('should return session by code', async () => {
    fixtures.whenGetSessionByCodeSucceeds();

    const result = await fixtures.whenGetSessionByCode();

    fixtures.thenGetSessionByCodeQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedSessionByCode(result);
  });

  it('should throw SessionServerError when getSessionByCode query fails', async () => {
    fixtures.whenGetSessionByCodeFails();

    const promise = fixtures.whenGetSessionByCode();

    await fixtures.thenThrowSessionServerError(promise);
    fixtures.thenGetSessionByCodeQueryBuiltWithExpectedArguments();
  });

  it('should create session', async () => {
    fixtures.whenCreateSessionSucceeds();

    const result = await fixtures.whenCreateSession();

    fixtures.thenCreateSessionQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedCreatedSession(result);
  });

  it('should throw SessionServerError when createSession fails', async () => {
    fixtures.whenCreateSessionFails();

    const promise = fixtures.whenCreateSession();

    await fixtures.thenThrowSessionServerError(promise);
    fixtures.thenCreateSessionQueryBuiltWithExpectedArguments();
  });
});

class Fixtures {
  public readonly teacherId = 'teacher-1';
  public readonly code = 'ABCD';
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
  public readonly sessionByCode = {
    id: 'session-1',
  };
  public readonly createSessionBody = {
    teacherId: this.teacherId,
    name: 'Cours 1',
    code: this.code,
    language: 'francais',
  };
  public readonly createdSession = {
    id: 'session-2',
    teacher_id: this.teacherId,
    name: this.createSessionBody.name,
    code: this.createSessionBody.code,
    language: this.createSessionBody.language,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  private readonly orderMock = jest.fn();
  private readonly listEqMock = jest.fn(() => ({ order: this.orderMock }));
  private readonly listSelectMock = jest.fn(() => ({ eq: this.listEqMock }));

  private readonly byCodeMaybeSingleMock = jest.fn();
  private readonly byCodeEqMock = jest.fn(() => ({
    maybeSingle: this.byCodeMaybeSingleMock,
  }));
  private readonly byCodeSelectMock = jest.fn(() => ({
    eq: this.byCodeEqMock,
  }));

  private readonly createSingleMock = jest.fn();
  private readonly createSelectMock = jest.fn(() => ({
    single: this.createSingleMock,
  }));
  private readonly createInsertMock = jest.fn(() => ({
    select: this.createSelectMock,
  }));

  private mode: 'list' | 'byCode' | 'create' = 'list';
  private readonly fromMock = jest.fn(() => {
    if (this.mode === 'list') return { select: this.listSelectMock };
    if (this.mode === 'byCode') return { select: this.byCodeSelectMock };
    return { insert: this.createInsertMock };
  });

  public readonly repository: SupabaseSessionRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new SupabaseSessionRepository(supabaseMock as any);
  }

  whenGetSessionsByTeacherId() {
    this.mode = 'list';
    return this.repository.getSessionsByTeacherId(this.teacherId);
  }

  whenGetSessionByCode() {
    this.mode = 'byCode';
    return this.repository.getSessionByCode(this.code);
  }

  whenCreateSession() {
    this.mode = 'create';
    return this.repository.createSession(this.createSessionBody as any);
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

  whenGetSessionByCodeSucceeds() {
    this.byCodeMaybeSingleMock.mockResolvedValue({
      data: this.sessionByCode,
      error: null,
    });
  }

  whenGetSessionByCodeFails() {
    this.byCodeMaybeSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'session by code query failed' },
    });
  }

  whenCreateSessionSucceeds() {
    this.createSingleMock.mockResolvedValue({
      data: this.createdSession,
      error: null,
    });
  }

  whenCreateSessionFails() {
    this.createSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'create session query failed' },
    });
  }

  async thenThrowSessionServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(SessionServerError);
  }

  thenQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.listSelectMock).toHaveBeenCalledWith('*');
    expect(this.listEqMock).toHaveBeenCalledWith('teacher_id', this.teacherId);
    expect(this.orderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(this.orderMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedSessions(result: unknown) {
    expect(result).toEqual(this.sessions);
  }

  thenGetSessionByCodeQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.byCodeSelectMock).toHaveBeenCalledWith('id');
    expect(this.byCodeEqMock).toHaveBeenCalledWith('code', this.code);
    expect(this.byCodeMaybeSingleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedSessionByCode(result: unknown) {
    expect(result).toEqual(this.sessionByCode);
  }

  thenCreateSessionQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.createInsertMock).toHaveBeenCalledWith({
      teacher_id: this.createSessionBody.teacherId,
      name: this.createSessionBody.name,
      code: this.createSessionBody.code,
      language: this.createSessionBody.language,
    });
    expect(this.createSelectMock).toHaveBeenCalledTimes(1);
    expect(this.createSingleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedCreatedSession(result: unknown) {
    expect(result).toEqual(this.createdSession);
  }
}
