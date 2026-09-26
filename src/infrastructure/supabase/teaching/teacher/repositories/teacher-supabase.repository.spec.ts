import { SupabaseClient } from '@supabase/supabase-js';
import { TeacherSupabaseRepository } from './teacher-supabase.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';

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

  it('should throw ServerError when establishment teachers query fails', async () => {
    fixtures.whenTeacherQueryReturnsError();

    const promise = fixtures.whenGetTeacherByEstablishmentId();

    await expect(promise).rejects.toBeInstanceOf(ServerError);
  });

  it('should return teacher by user id', async () => {
    fixtures.whenGetTeacherByUserIdReturnsData();

    const result = await fixtures.whenGetTeacherByUserId();

    fixtures.thenGetTeacherByUserIdQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedTeacher(result);
  });

  it('should throw ServerError when getTeacherByUserId fails', async () => {
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

  it('should throw ServerError when createTeacher fails', async () => {
    fixtures.whenCreateTeacherReturnsError();

    const promise = fixtures.whenCreateTeacher();

    await fixtures.thenThrowTeacherServerError(promise);
  });

  it('should update teacher by supabase user id', async () => {
    fixtures.whenUpdateTeacherProfileSucceeds();

    await fixtures.whenUpdateTeacherProfile();

    fixtures.thenUpdateTeacherProfileQueryBuilt();
  });

  it('should throw ServerError when updateTeacher fails', async () => {
    fixtures.whenUpdateTeacherProfileFails();

    await expect(fixtures.whenUpdateTeacherProfile()).rejects.toBeInstanceOf(ServerError);
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

    await expect(promise).rejects.toBeInstanceOf(ServerError);
    fixtures.thenRollbackInvitationTokenCalled();
  });

  it('should return mapped teacher when getTeacherByConditions succeeds', async () => {
    fixtures.whenGetTeacherByConditionsSucceeds();

    const result = await fixtures.whenGetTeacherByConditions();

    fixtures.thenGetTeacherByConditionsQueryBuilt();
    fixtures.thenReturnExpectedTeacher(result);
  });

  it('should return null when getTeacherByConditions has no match', async () => {
    fixtures.whenGetTeacherByConditionsReturnsNull();

    const result = await fixtures.whenGetTeacherByConditions();

    expect(result).toBeNull();
  });

  it('should throw ServerError when getTeacherByConditions fails', async () => {
    fixtures.whenGetTeacherByConditionsFails();

    const promise = fixtures.whenGetTeacherByConditions();

    await expect(promise).rejects.toBeInstanceOf(ServerError);
  });

  it('should create teacher with invitation token', async () => {
    fixtures.whenCreateTeacherWithInvitationReturnsData();

    const result = await fixtures.whenCreateTeacherWithInvitationToken();

    fixtures.thenCreateTeacherWithInvitationQueryBuilt();
    expect(result).toEqual(fixtures.expectedTeacherWithEstablishment);
  });

  it('should throw ServerError when createTeacherWithInvitationToken fails', async () => {
    fixtures.whenCreateTeacherWithInvitationReturnsError();

    await expect(fixtures.whenCreateTeacherWithInvitationToken()).rejects.toBeInstanceOf(ServerError);
  });

  it('should delete teacher by id', async () => {
    fixtures.whenDeleteTeacherSucceeds();

    await fixtures.whenDeleteTeacher();

    fixtures.thenDeleteTeacherQueryBuilt();
  });

  it('should throw ServerError when deleteTeacher fails', async () => {
    fixtures.whenDeleteTeacherFails();

    await expect(fixtures.whenDeleteTeacher()).rejects.toBeInstanceOf(ServerError);
  });
});

class Fixtures {
  public readonly establishmentId = 'est-1';
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
  public readonly invitationTokenId = 'token-1';
  public readonly establishmentIdToLink = 'est-2';

  public readonly authUser = {
    id: 'auth-u1',
    email: 'prof1@school.com',
    metadata: {
      role: 'teacher' as const,
      firstname: 'Prof',
      lastname: '1',
      acceptTerms: true,
    },
  };

  public readonly invitationToken = {
    id: 'inv-1',
    establishmentId: this.establishmentId,
    token: 'tok-abc',
    invitedEmail: 'prof1@school.com',
    expiresAt: '2026-12-31T00:00:00.000Z',
    usedAt: null,
    usedBy: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    assignedChatbots: 3,
  };

  public readonly teacherWithEstablishmentSupabaseRow = {
    id: 'teacher-1',
    name: 'Prof 1',
    email: 'prof1@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    establishment_id: this.establishmentId,
    available_chatbots: 3,
    supabase_user_id: 'auth-u1',
  };

  public readonly expectedTeacherWithEstablishment = {
    id: 'teacher-1',
    name: 'Prof 1',
    email: 'prof1@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: this.establishmentId,
    availableChatbots: 3,
    supabaseUserId: 'auth-u1',
  };

  public readonly teacherProfilePayload = {
    name: 'Prof Updated',
    email: 'prof@school.com',
  };

  private readonly teacherEqMock = jest.fn();
  private readonly teacherSelectMock = jest.fn(() => ({
    eq: this.teacherEqMock,
  }));
  private readonly teacherFromMock = jest.fn(() => ({
    select: this.teacherSelectMock,
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

  private readonly teacherProfileEqMock = jest.fn();
  private readonly teacherProfileUpdateMock = jest.fn(() => ({
    eq: this.teacherProfileEqMock,
  }));

  private readonly deleteTeacherEqMock = jest.fn();
  private readonly deleteTeacherDeleteMock = jest.fn(() => ({
    eq: this.deleteTeacherEqMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'teachers') {
      if (this.deleteTeacherModeEnabled) return { delete: this.deleteTeacherDeleteMock };
      if (this.updateTeacherProfileModeEnabled) return { update: this.teacherProfileUpdateMock };
      if (this.linkModeEnabled) return this.linkFromMock();
      if (this.byUserModeEnabled) return this.byUserFromMock();
      if (this.createModeEnabled) return this.createFromMock();
      if (this.byConditionsModeEnabled) return { select: this.conditionsSelectMock };
      return this.teacherFromMock();
    }
    if (table === 'invitation_tokens') return this.rollbackFromMock();
    return {};
  });

  public readonly repository: TeacherSupabaseRepository;
  private byUserModeEnabled = false;
  private createModeEnabled = false;
  private linkModeEnabled = false;
  private byConditionsModeEnabled = false;
  private updateTeacherProfileModeEnabled = false;
  private deleteTeacherModeEnabled = false;

  private readonly conditionsMaybeSingleMock = jest.fn();
  private readonly conditionsEqMock = jest.fn();
  private readonly conditionsSelectMock = jest.fn();

  constructor() {
    const conditionsChain = {
      eq: this.conditionsEqMock,
      maybeSingle: this.conditionsMaybeSingleMock,
    };
    this.conditionsEqMock.mockReturnValue(conditionsChain);
    this.conditionsSelectMock.mockReturnValue(conditionsChain);

    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new TeacherSupabaseRepository(supabaseMock as unknown as SupabaseClient);
  }

  whenGetTeacherByEstablishmentId() {
    return this.repository.getTeacherByEstablishmentId(this.establishmentId);
  }

  whenGetTeacherByUserId() {
    this.byUserModeEnabled = true;
    return this.repository.getTeacherByUserId(this.teacherSupabaseRow.supabase_user_id);
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

  whenUpdateTeacherProfile() {
    this.updateTeacherProfileModeEnabled = true;
    return this.repository.updateTeacher(this.teacherSupabaseRow.supabase_user_id, this.teacherProfilePayload);
  }

  whenDeleteTeacher() {
    this.deleteTeacherModeEnabled = true;
    return this.repository.deleteTeacher(this.teacherSupabaseRow.id);
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

  whenUpdateTeacherProfileSucceeds() {
    this.teacherProfileEqMock.mockResolvedValue({ error: null });
  }

  whenUpdateTeacherProfileFails() {
    this.teacherProfileEqMock.mockResolvedValue({
      error: { message: 'teacher profile update failed' },
    });
  }

  whenDeleteTeacherSucceeds() {
    this.deleteTeacherEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteTeacherFails() {
    this.deleteTeacherEqMock.mockResolvedValue({
      error: { message: 'delete teacher failed' },
    });
  }

  async thenThrowTeacherServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
  }

  thenTeacherQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.teacherSelectMock).toHaveBeenCalledWith('*');
    expect(this.teacherEqMock).toHaveBeenCalledWith('establishment_id', this.establishmentId);
  }

  thenReturnExpectedTeachers(result: unknown) {
    expect(result).toEqual(this.expectedTeachers);
  }

  thenGetTeacherByUserIdQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.byUserSelectMock).toHaveBeenCalledWith('*');
    expect(this.byUserEqMock).toHaveBeenCalledWith('supabase_user_id', this.teacherSupabaseRow.supabase_user_id);
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
    expect(this.linkEqMock).toHaveBeenCalledWith('id', this.teacherSupabaseRow.id);
  }

  thenRollbackInvitationTokenCalled() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.rollbackUpdateMock).toHaveBeenCalledWith({
      used_at: null,
      used_by: null,
    });
    expect(this.rollbackEqMock).toHaveBeenCalledWith('id', this.invitationTokenId);
  }

  thenRollbackInvitationTokenNotCalled() {
    expect(this.rollbackUpdateMock).not.toHaveBeenCalled();
    expect(this.rollbackEqMock).not.toHaveBeenCalled();
  }

  thenUpdateTeacherProfileQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.teacherProfileUpdateMock).toHaveBeenCalledWith(this.teacherProfilePayload);
    expect(this.teacherProfileEqMock).toHaveBeenCalledWith(
      'supabase_user_id',
      this.teacherSupabaseRow.supabase_user_id,
    );
  }

  thenDeleteTeacherQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.deleteTeacherDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.deleteTeacherEqMock).toHaveBeenCalledWith('id', this.teacherSupabaseRow.id);
  }

  thenReturnExpectedTeacher(result: unknown) {
    expect(result).toEqual(this.expectedTeacher);
  }

  whenGetTeacherByConditions() {
    this.byConditionsModeEnabled = true;
    return this.repository.getTeacherByConditions({
      id: this.teacherSupabaseRow.id,
      establishmentId: this.establishmentId,
    });
  }

  whenGetTeacherByConditionsSucceeds() {
    this.conditionsMaybeSingleMock.mockResolvedValue({
      data: this.teacherSupabaseRow,
      error: null,
    });
  }

  whenGetTeacherByConditionsReturnsNull() {
    this.conditionsMaybeSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenGetTeacherByConditionsFails() {
    this.conditionsMaybeSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'conditions query failed' },
    });
  }

  thenGetTeacherByConditionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.conditionsSelectMock).toHaveBeenCalledWith('*');
    expect(this.conditionsEqMock).toHaveBeenCalledWith('id', this.teacherSupabaseRow.id);
    expect(this.conditionsEqMock).toHaveBeenCalledWith('establishment_id', this.establishmentId);
    expect(this.conditionsEqMock).toHaveBeenCalledTimes(2);
    expect(this.conditionsMaybeSingleMock).toHaveBeenCalledTimes(1);
  }

  whenCreateTeacherWithInvitationToken() {
    this.createModeEnabled = true;
    return this.repository.createTeacherWithInvitationToken(this.authUser, this.invitationToken);
  }

  whenCreateTeacherWithInvitationReturnsData() {
    this.createSingleMock.mockResolvedValue({
      data: this.teacherWithEstablishmentSupabaseRow,
      error: null,
    });
  }

  whenCreateTeacherWithInvitationReturnsError() {
    this.createSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'create teacher with invitation failed' },
    });
  }

  thenCreateTeacherWithInvitationQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.createInsertMock).toHaveBeenCalledWith({
      supabase_user_id: this.authUser.id,
      name: 'Prof 1',
      email: this.authUser.email,
      establishment_id: this.invitationToken.establishmentId,
      available_chatbots: this.invitationToken.assignedChatbots,
    });
    expect(this.createSelectMock).toHaveBeenCalledTimes(1);
    expect(this.createSingleMock).toHaveBeenCalledTimes(1);
  }
}
