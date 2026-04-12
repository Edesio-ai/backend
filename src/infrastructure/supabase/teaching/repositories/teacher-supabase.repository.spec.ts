import { TeacherSupabaseRepository } from './teacher-supabase.repository';
import { TeacheServerError } from '../../../../domain/teaching/error';

describe('TeacherSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return teachers for establishment id', async () => {
    fixtures.whenTeacherQueryReturnsData();

    const result = await fixtures.whenGetTeacherByEstablishmentId();

    fixtures.thenTeacherQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedTeachers(result);
  });

  it('should throw TeacherNotFoundError when teacher query fails', async () => {
    fixtures.whenTeacherQueryReturnsError();

    const promise = fixtures.whenGetTeacherByEstablishmentId();

    await fixtures.thenThrowTeacherServerError(promise);
  });

  it('should return sessions for teacher ids', async () => {
    fixtures.whenSessionsQueryReturnsData();

    const result = await fixtures.whenGetTeachersSessionsByIds(
      fixtures.teacherIds,
    );

    fixtures.thenSessionsQueryBuiltWithTeacherIds(fixtures.teacherIds);
    fixtures.thenReturnExpectedSessions(result);
  });

  it('should use fallback uuid when teacher ids are empty', async () => {
    fixtures.whenSessionsQueryReturnsData();

    await fixtures.whenGetTeachersSessionsByIds([]);

    fixtures.thenSessionsQueryBuiltWithFallbackId();
  });

  it('should throw TeacherSessionsNotFoundError when sessions query fails', async () => {
    fixtures.whenSessionsQueryReturnsError();

    const promise = fixtures.whenGetTeachersSessionsByIds(fixtures.teacherIds);

    await fixtures.thenThrowTeacherServerError(promise);
  });

  it('should return teacher by user id', async () => {
    fixtures.whenGetTeacherByUserIdReturnsData();

    const result = await fixtures.whenGetTeacherByUserId();

    fixtures.thenGetTeacherByUserIdQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedTeacher(result);
  });

  it('should throw TeacheServerError when getTeacherByUserId fails', async () => {
    fixtures.whenGetTeacherByUserIdReturnsError();

    const promise = fixtures.whenGetTeacherByUserId();

    await fixtures.thenThrowTeacherServerError(promise);
  });

  it('should return null when getTeacherByUserId has no match', async () => {
    fixtures.whenGetTeacherByUserIdReturnsNull();

    const result = await fixtures.whenGetTeacherByUserId();

    fixtures.thenGetTeacherByUserIdQueryBuiltWithExpectedArguments();
    expect(result).toBeNull();
  });

  it('should create teacher', async () => {
    fixtures.whenCreateTeacherReturnsData();

    const result = await fixtures.whenCreateTeacher();

    fixtures.thenCreateTeacherQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedTeacher(result);
  });

  it('should throw TeacheServerError when createTeacher fails', async () => {
    fixtures.whenCreateTeacherReturnsError();

    const promise = fixtures.whenCreateTeacher();

    await fixtures.thenThrowTeacherServerError(promise);
  });

  it('should link teacher to establishment', async () => {
    fixtures.whenLinkTeacherReturnsSuccess();

    await fixtures.whenLinkTeacherToEstablishment();

    fixtures.thenLinkTeacherQueryBuiltWithExpectedArguments();
    fixtures.thenRollbackInvitationTokenNotCalled();
  });

  it('should rollback token and throw when linking teacher fails', async () => {
    fixtures.whenLinkTeacherReturnsError();
    fixtures.whenRollbackInvitationTokenSuccess();

    const promise = fixtures.whenLinkTeacherToEstablishment();

    await fixtures.thenThrowTeacherServerError(promise);
    fixtures.thenRollbackInvitationTokenCalled();
  });
});

class Fixtures {
  public readonly establishmentId = 'est-1';
  public readonly teacherIds = ['teacher-1', 'teacher-2'];
  public readonly fallbackId = '00000000-0000-0000-0000-000000000000';
  public readonly teachersSupabaseRows = [
    {
      id: 'teacher-1',
      name: 'Prof 1',
      email: 'prof1@school.com',
      created_at: '2026-01-01T00:00:00.000Z',
      establishment_id: this.establishmentId,
      available_chatbots: 0,
      supabase_user_id: null,
    },
  ];
  public readonly expectedTeachers = [
    {
      id: 'teacher-1',
      name: 'Prof 1',
      email: 'prof1@school.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      establishmentId: this.establishmentId,
      availableChatbots: 0,
      supabaseUserId: undefined,
    },
  ];
  public readonly teacherSupabaseRow = {
    id: 'teacher-1',
    name: 'Prof 1',
    email: 'prof1@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    establishment_id: null,
    available_chatbots: 1,
    supabase_user_id: 'user-1',
  };
  public readonly expectedTeacher = {
    id: 'teacher-1',
    name: 'Prof 1',
    email: 'prof1@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null,
    availableChatbots: 1,
    supabaseUserId: 'user-1',
  };
  public readonly sessionsSupabaseRows = [
    {
      id: 'session-1',
      name: 'S1',
      code: 'C1',
      language: 'francais',
      teacher_id: 'teacher-1',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];
  public readonly expectedTeacherSessions = [
    {
      id: 'session-1',
      name: 'S1',
      code: 'C1',
      language: 'francais',
      teacherId: 'teacher-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  public readonly invitationTokenId = 'token-1';
  public readonly establishmentIdToLink = 'est-2';

  private readonly teacherEqMock = jest.fn();
  private readonly teacherSelectMock = jest.fn(() => ({
    eq: this.teacherEqMock,
  }));
  private readonly teacherFromMock = jest.fn(() => ({
    select: this.teacherSelectMock,
  }));

  private readonly sessionsInMock = jest.fn();
  private readonly sessionsSelectMock = jest.fn(() => ({
    in: this.sessionsInMock,
  }));
  private readonly sessionsFromMock = jest.fn(() => ({
    select: this.sessionsSelectMock,
  }));

  private readonly byUserMaybeSingleMock = jest.fn();
  private readonly byUserEqMock = jest.fn(() => ({
    maybeSingle: this.byUserMaybeSingleMock,
  }));
  private readonly byUserSelectMock = jest.fn(() => ({
    eq: this.byUserEqMock,
  }));
  private readonly byUserFromMock = jest.fn(() => ({
    select: this.byUserSelectMock,
  }));

  private readonly createSingleMock = jest.fn();
  private readonly createSelectMock = jest.fn(() => ({
    single: this.createSingleMock,
  }));
  private readonly createInsertMock = jest.fn(() => ({
    select: this.createSelectMock,
  }));
  private readonly createFromMock = jest.fn(() => ({
    insert: this.createInsertMock,
  }));

  private readonly linkEqMock = jest.fn();
  private readonly linkUpdateMock = jest.fn(() => ({ eq: this.linkEqMock }));
  private readonly linkFromMock = jest.fn(() => ({
    update: this.linkUpdateMock,
  }));

  private readonly rollbackEqMock = jest.fn();
  private readonly rollbackUpdateMock = jest.fn(() => ({
    eq: this.rollbackEqMock,
  }));
  private readonly rollbackFromMock = jest.fn(() => ({
    update: this.rollbackUpdateMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'teachers') {
      if (this.linkModeEnabled) return this.linkFromMock();
      if (this.byUserModeEnabled) return this.byUserFromMock();
      if (this.createModeEnabled) return this.createFromMock();
      return this.teacherFromMock();
    }
    if (table === 'sessions') return this.sessionsFromMock();
    if (table === 'invitation_tokens') return this.rollbackFromMock();
    return {};
  });

  public readonly repository: TeacherSupabaseRepository;
  private byUserModeEnabled = false;
  private createModeEnabled = false;
  private linkModeEnabled = false;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new TeacherSupabaseRepository(supabaseMock as any);
  }

  whenGetTeacherByEstablishmentId() {
    return this.repository.getTeacherByEstablishmentId(this.establishmentId);
  }

  whenGetTeachersSessionsByIds(ids: string[]) {
    return this.repository.getTeachersSessionsByIds(ids);
  }

  whenGetTeacherByUserId() {
    this.byUserModeEnabled = true;
    return this.repository.getTeacherByUserId(
      this.teacherSupabaseRow.supabase_user_id,
    );
  }

  whenCreateTeacher() {
    this.createModeEnabled = true;
    return this.repository.createTeacher(
      this.teacherSupabaseRow.supabase_user_id,
      this.teacherSupabaseRow.name,
      this.teacherSupabaseRow.email,
    );
  }

  whenLinkTeacherToEstablishment() {
    this.linkModeEnabled = true;
    return this.repository.linkTeacherToEstablishment(
      this.invitationTokenId,
      this.teacherSupabaseRow.id,
      this.establishmentIdToLink,
    );
  }

  whenTeacherQueryReturnsData() {
    this.teacherEqMock.mockResolvedValue({
      data: this.teachersSupabaseRows,
      error: null,
    });
  }

  whenTeacherQueryReturnsError() {
    this.teacherEqMock.mockResolvedValue({
      data: null,
      error: { message: 'teacher query failed' },
    });
  }

  whenSessionsQueryReturnsData() {
    this.sessionsInMock.mockResolvedValue({
      data: this.sessionsSupabaseRows,
      error: null,
    });
  }

  whenSessionsQueryReturnsError() {
    this.sessionsInMock.mockResolvedValue({
      data: null,
      error: { message: 'sessions query failed' },
    });
  }

  whenGetTeacherByUserIdReturnsData() {
    this.byUserMaybeSingleMock.mockResolvedValue({
      data: this.teacherSupabaseRow,
      error: null,
    });
  }

  whenGetTeacherByUserIdReturnsError() {
    this.byUserMaybeSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'teacher by user failed' },
    });
  }

  whenGetTeacherByUserIdReturnsNull() {
    this.byUserMaybeSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenCreateTeacherReturnsData() {
    this.createSingleMock.mockResolvedValue({
      data: this.teacherSupabaseRow,
      error: null,
    });
  }

  whenCreateTeacherReturnsError() {
    this.createSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'create teacher failed' },
    });
  }

  whenLinkTeacherReturnsSuccess() {
    this.linkEqMock.mockResolvedValue({ error: null });
  }

  whenLinkTeacherReturnsError() {
    this.linkEqMock.mockResolvedValue({ error: { message: 'update failed' } });
  }

  whenRollbackInvitationTokenSuccess() {
    this.rollbackEqMock.mockResolvedValue({ error: null });
  }

  async thenThrowTeacherServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(TeacheServerError);
  }

  thenTeacherQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.teacherSelectMock).toHaveBeenCalledWith('*');
    expect(this.teacherEqMock).toHaveBeenCalledWith(
      'establishment_id',
      this.establishmentId,
    );
  }

  thenSessionsQueryBuiltWithTeacherIds(ids: string[]) {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.sessionsSelectMock).toHaveBeenCalledWith(
      'id, name, code, language, teacher_id, created_at',
    );
    expect(this.sessionsInMock).toHaveBeenCalledWith('teacher_id', ids);
  }

  thenSessionsQueryBuiltWithFallbackId() {
    expect(this.sessionsInMock).toHaveBeenCalledWith('teacher_id', [
      this.fallbackId,
    ]);
  }

  thenReturnExpectedTeachers(result: any) {
    expect(result).toEqual(this.expectedTeachers);
  }

  thenReturnExpectedSessions(result: any) {
    expect(result).toEqual(this.expectedTeacherSessions);
  }

  thenGetTeacherByUserIdQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.byUserSelectMock).toHaveBeenCalledWith('*');
    expect(this.byUserEqMock).toHaveBeenCalledWith(
      'supabase_user_id',
      this.teacherSupabaseRow.supabase_user_id,
    );
    expect(this.byUserMaybeSingleMock).toHaveBeenCalledTimes(1);
  }

  thenCreateTeacherQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.createInsertMock).toHaveBeenCalledWith({
      supabase_user_id: this.teacherSupabaseRow.supabase_user_id,
      name: this.teacherSupabaseRow.name,
      email: this.teacherSupabaseRow.email,
    });
    expect(this.createSelectMock).toHaveBeenCalledTimes(1);
    expect(this.createSingleMock).toHaveBeenCalledTimes(1);
  }

  thenLinkTeacherQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.linkUpdateMock).toHaveBeenCalledWith({
      establishment_id: this.establishmentIdToLink,
    });
    expect(this.linkEqMock).toHaveBeenCalledWith(
      'id',
      this.teacherSupabaseRow.id,
    );
  }

  thenRollbackInvitationTokenCalled() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.rollbackUpdateMock).toHaveBeenCalledWith({
      used_at: null,
      used_by: null,
    });
    expect(this.rollbackEqMock).toHaveBeenCalledWith(
      'id',
      this.invitationTokenId,
    );
  }

  thenRollbackInvitationTokenNotCalled() {
    expect(this.rollbackUpdateMock).not.toHaveBeenCalled();
    expect(this.rollbackEqMock).not.toHaveBeenCalled();
  }

  thenReturnExpectedTeacher(result: any) {
    expect(result).toEqual(this.expectedTeacher);
  }
}
