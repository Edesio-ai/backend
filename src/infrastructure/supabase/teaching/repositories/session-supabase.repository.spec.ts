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

  it('should return null when getSessionByCode has no row', async () => {
    fixtures.whenGetSessionByCodeReturnsNull();

    const result = await fixtures.whenGetSessionByCode();

    expect(result).toBeNull();
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

  it('should update session name', async () => {
    fixtures.whenUpdateSessionNameSucceeds();

    const result = await fixtures.whenUpdateSessionName();

    fixtures.thenUpdateSessionNameQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedUpdatedSession(result);
  });

  it('should throw SessionServerError when updateSessionName fails', async () => {
    fixtures.whenUpdateSessionNameFails();

    const promise = fixtures.whenUpdateSessionName();

    await fixtures.thenThrowSessionServerError(promise);
    fixtures.thenUpdateSessionNameQueryBuiltWithExpectedArguments();
  });

  it('should delete session by id and teacher id', async () => {
    fixtures.whenDeleteSessionSucceeds();

    await fixtures.whenDeleteSessionByTeacherId();

    fixtures.thenDeleteSessionQueryBuiltWithExpectedArguments();
  });

  it('should throw SessionServerError when deleteSessionByTeacherId fails', async () => {
    fixtures.whenDeleteSessionFails();

    const promise = fixtures.whenDeleteSessionByTeacherId();

    await fixtures.thenThrowSessionServerError(promise);
    fixtures.thenDeleteSessionQueryBuiltWithExpectedArguments();
  });

  it('should return session when getSessionById succeeds', async () => {
    fixtures.whenGetSessionByIdSucceeds();

    const result = await fixtures.whenGetSessionById();

    fixtures.thenGetSessionByIdQueryBuilt();
    expect(result).toEqual(fixtures.expectedSessionById);
  });

  it('should throw SessionServerError when getSessionById fails', async () => {
    fixtures.whenGetSessionByIdFails();

    const promise = fixtures.whenGetSessionById();

    await fixtures.thenThrowSessionServerError(promise);
    fixtures.thenGetSessionByIdQueryBuilt();
  });
});

class Fixtures {
  public readonly teacherId = 'teacher-1';
  public readonly code = 'ABCD';
  public readonly sessionsSupabaseRows = [
    {
      id: 'session-1',
      teacher_id: this.teacherId,
      name: 'Cours 1',
      code: 'ABCD',
      language: 'francais' as const,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];
  public readonly expectedSessions = [
    {
      id: 'session-1',
      teacherId: this.teacherId,
      name: 'Cours 1',
      code: 'ABCD',
      language: 'francais' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  public readonly sessionByCodeSupabaseRow = {
    id: 'session-1',
    teacher_id: this.teacherId,
    name: 'By code',
    code: this.code,
    language: 'francais' as const,
    created_at: '2026-01-01T00:00:00.000Z',
  };
  public readonly expectedSessionByCode = {
    id: 'session-1',
    teacherId: this.teacherId,
    name: 'By code',
    code: this.code,
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  public readonly createSessionBody = {
    teacherId: this.teacherId,
    name: 'Cours 1',
    code: this.code,
    language: 'francais' as const,
  };
  public readonly createdSessionSupabaseRow = {
    id: 'session-2',
    teacher_id: this.teacherId,
    name: this.createSessionBody.name,
    code: this.createSessionBody.code,
    language: this.createSessionBody.language,
    created_at: '2026-01-01T00:00:00.000Z',
  };
  public readonly expectedCreatedSession = {
    id: 'session-2',
    teacherId: this.teacherId,
    name: this.createSessionBody.name,
    code: this.createSessionBody.code,
    language: this.createSessionBody.language,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  public readonly updateSessionBody = {
    name: 'Updated Session Name',
    teacherId: this.teacherId,
  };
  public readonly sessionIdToUpdate = 'session-2';
  public readonly sessionIdToDelete = 'session-1';
  public readonly updatedSessionSupabaseRow = {
    id: this.sessionIdToUpdate,
    teacher_id: this.teacherId,
    name: this.updateSessionBody.name,
    code: 'NEW123',
    language: 'francais' as const,
    created_at: '2026-01-01T00:00:00.000Z',
  };
  public readonly expectedUpdatedSession = {
    id: this.sessionIdToUpdate,
    teacherId: this.teacherId,
    name: this.updateSessionBody.name,
    code: 'NEW123',
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly sessionIdForGetById = 'session-by-id-1';
  public readonly sessionByIdSupabaseRow = {
    id: this.sessionIdForGetById,
    teacher_id: this.teacherId,
    name: 'Session par id',
    code: 'CODE1',
    language: 'francais' as const,
    created_at: '2026-01-01T00:00:00.000Z',
  };
  public readonly expectedSessionById = {
    id: this.sessionIdForGetById,
    teacherId: this.teacherId,
    name: 'Session par id',
    code: 'CODE1',
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  private readonly byIdSingleMock = jest.fn();
  private readonly byIdEqMock = jest.fn(() => ({
    single: this.byIdSingleMock,
  }));
  private readonly byIdSelectMock = jest.fn(() => ({
    eq: this.byIdEqMock,
  }));

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

  private readonly updateSingleMock = jest.fn();
  private readonly updateSelectMock = jest.fn(() => ({
    single: this.updateSingleMock,
  }));
  private readonly updateTeacherEqMock = jest.fn(() => ({
    select: this.updateSelectMock,
  }));
  private readonly updateIdEqMock = jest.fn(() => ({
    eq: this.updateTeacherEqMock,
  }));
  private readonly updateUpdateMock = jest.fn(() => ({
    eq: this.updateIdEqMock,
  }));

  private readonly deleteTeacherEqMock = jest.fn();
  private readonly deleteIdEqMock = jest.fn(() => ({
    eq: this.deleteTeacherEqMock,
  }));
  private readonly sessionDeleteMock = jest.fn(() => ({
    eq: this.deleteIdEqMock,
  }));

  private mode: 'list' | 'byCode' | 'byId' | 'create' | 'update' | 'delete' =
    'list';
  private readonly fromMock = jest.fn(() => {
    if (this.mode === 'list') return { select: this.listSelectMock };
    if (this.mode === 'byCode') return { select: this.byCodeSelectMock };
    if (this.mode === 'byId') return { select: this.byIdSelectMock };
    if (this.mode === 'create') return { insert: this.createInsertMock };
    if (this.mode === 'update') return { update: this.updateUpdateMock };
    return { delete: this.sessionDeleteMock };
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
    return this.repository.createSession(this.createSessionBody);
  }

  whenUpdateSessionName() {
    this.mode = 'update';
    return this.repository.updateSessionName(
      this.sessionIdToUpdate,
      this.updateSessionBody,
    );
  }

  whenDeleteSessionByTeacherId() {
    this.mode = 'delete';
    return this.repository.deleteSessionByTeacherId(
      this.sessionIdToDelete,
      this.teacherId,
    );
  }

  whenGetSessionById() {
    this.mode = 'byId';
    return this.repository.getSessionById(this.sessionIdForGetById);
  }

  whenSessionsQuerySucceeds() {
    this.orderMock.mockResolvedValue({
      data: this.sessionsSupabaseRows,
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
      data: this.sessionByCodeSupabaseRow,
      error: null,
    });
  }

  whenGetSessionByCodeFails() {
    this.byCodeMaybeSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'session by code query failed' },
    });
  }

  whenGetSessionByCodeReturnsNull() {
    this.byCodeMaybeSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenCreateSessionSucceeds() {
    this.createSingleMock.mockResolvedValue({
      data: this.createdSessionSupabaseRow,
      error: null,
    });
  }

  whenCreateSessionFails() {
    this.createSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'create session query failed' },
    });
  }

  whenUpdateSessionNameSucceeds() {
    this.updateSingleMock.mockResolvedValue({
      data: this.updatedSessionSupabaseRow,
      error: null,
    });
  }

  whenUpdateSessionNameFails() {
    this.updateSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'update session query failed' },
    });
  }

  whenDeleteSessionSucceeds() {
    this.deleteTeacherEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteSessionFails() {
    this.deleteTeacherEqMock.mockResolvedValue({
      error: { message: 'delete session failed' },
    });
  }

  whenGetSessionByIdSucceeds() {
    this.byIdSingleMock.mockResolvedValue({
      data: this.sessionByIdSupabaseRow,
      error: null,
    });
  }

  whenGetSessionByIdFails() {
    this.byIdSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'session by id failed' },
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
    expect(result).toEqual(this.expectedSessions);
  }

  thenGetSessionByCodeQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.byCodeSelectMock).toHaveBeenCalledWith('*');
    expect(this.byCodeEqMock).toHaveBeenCalledWith('code', this.code);
    expect(this.byCodeMaybeSingleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedSessionByCode(result: unknown) {
    expect(result).toEqual(this.expectedSessionByCode);
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
    expect(result).toEqual(this.expectedCreatedSession);
  }

  thenUpdateSessionNameQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.updateUpdateMock).toHaveBeenCalledWith({
      name: this.updateSessionBody.name,
    });
    expect(this.updateIdEqMock).toHaveBeenCalledWith(
      'id',
      this.sessionIdToUpdate,
    );
    expect(this.updateTeacherEqMock).toHaveBeenCalledWith(
      'teacher_id',
      this.updateSessionBody.teacherId,
    );
    expect(this.updateSelectMock).toHaveBeenCalledTimes(1);
    expect(this.updateSingleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedUpdatedSession(result: unknown) {
    expect(result).toEqual(this.expectedUpdatedSession);
  }

  thenDeleteSessionQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.sessionDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.deleteIdEqMock).toHaveBeenCalledWith(
      'id',
      this.sessionIdToDelete,
    );
    expect(this.deleteTeacherEqMock).toHaveBeenCalledWith(
      'teacher_id',
      this.teacherId,
    );
  }

  thenGetSessionByIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.byIdSelectMock).toHaveBeenCalledWith('id, teacher_id');
    expect(this.byIdEqMock).toHaveBeenCalledWith(
      'id',
      this.sessionIdForGetById,
    );
    expect(this.byIdSingleMock).toHaveBeenCalledTimes(1);
  }
}
