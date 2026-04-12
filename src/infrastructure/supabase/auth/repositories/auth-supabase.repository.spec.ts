import { AuthSupabaseRepository } from './auth-supabase.repository';
import {
  InvitationToken,
  InvitationTokenPreview,
} from '../../../../domain/auth/invitation.type';
import {
  InvitationTokenCreationError,
  InvitationTokenAlreadyUsedError,
  InvitationTokenExpiredError,
  InvitationTokenNotFoundError,
  LogoutError,
  UserAlereadyExistsError,
  UserCreationError,
  UserCreationFailedError,
  TeacherProfileCreationError,
  TokenUpdateError,
  UserLoginError,
} from '../../../../domain/auth/errors/auth.errors';
import {
  AuthUserWithSession,
  Session,
} from '../../../../domain/auth/types/auth.type';

describe('AuthSupabaseRepository', () => {
  describe('getInvitationPreview', () => {
    let fixtures: GetInvitationPreviewFixtures;

    beforeEach(() => {
      fixtures = new GetInvitationPreviewFixtures();
    });

    it('should return mapped preview when token is valid', async () => {
      fixtures.whenSupabaseReturnsData();

      const result = await fixtures.whenGetInvitationPreview();

      fixtures.thenQueryIsBuiltWithToken();
      fixtures.thenReturnExpectedPreview(result);
    });

    it('should throw InvitationTokenNotFoundError when supabase returns error', async () => {
      fixtures.whenSupabaseReturnsError();

      const promise = fixtures.whenGetInvitationPreview();

      await fixtures.thenThrowNotFound(promise);
    });

    it('should throw InvitationTokenAlreadyUsedError when token already used', async () => {
      fixtures.whenTokenAlreadyUsed();

      const promise = fixtures.whenGetInvitationPreview();

      await fixtures.thenThrowAlreadyUsed(promise);
    });

    it('should throw InvitationTokenExpiredError when token is expired', async () => {
      fixtures.whenTokenExpired();

      const promise = fixtures.whenGetInvitationPreview();

      await fixtures.thenThrowExpired(promise);
    });
  });

  describe('createInvitationToken', () => {
    let fixtures: CreateInvitationTokenFixtures;

    beforeEach(() => {
      fixtures = new CreateInvitationTokenFixtures();
    });

    it('should insert invitation token with normalized email and mapped fields', async () => {
      fixtures.whenInsertSucceeds();

      await fixtures.whenCreateInvitationToken();

      fixtures.thenInsertQueryBuiltWithExpectedPayload();
    });

    it('should throw InvitationTokenCreationError when insert fails', async () => {
      fixtures.whenInsertFails();

      const promise = fixtures.whenCreateInvitationToken();

      await fixtures.thenThrowInvitationTokenCreationError(promise);
      fixtures.thenInsertQueryBuiltWithExpectedPayload();
    });
  });

  describe('loginUser', () => {
    let fixtures: LoginUserFixtures;

    beforeEach(() => {
      fixtures = new LoginUserFixtures();
    });

    it('should return auth user with session when signInWithPassword succeeds', async () => {
      fixtures.whenSignInWithPasswordSucceeds();

      const result = await fixtures.whenLoginUser();

      fixtures.thenSignInWithPasswordCalledWithNormalizedEmail();
      expect(result).toEqual(fixtures.expectedAuthUserWithSession);
    });

    it('should throw UserLoginError when signInWithPassword returns error', async () => {
      fixtures.whenSignInWithPasswordFails();

      const promise = fixtures.whenLoginUser();

      await fixtures.thenThrowUserLoginError(promise);
      fixtures.thenSignInWithPasswordCalledWithNormalizedEmail();
    });
  });

  describe('logoutUser', () => {
    let fixtures: LogoutUserFixtures;

    beforeEach(() => {
      fixtures = new LogoutUserFixtures();
    });

    it('should call auth.admin.signOut with global scope when logout succeeds', async () => {
      fixtures.whenSignOutSucceeds();

      await fixtures.whenLogoutUser();

      fixtures.thenSignOutCalledWithExpectedArgs();
    });

    it('should throw LogoutError when signOut returns error', async () => {
      fixtures.whenSignOutFails();

      const promise = fixtures.whenLogoutUser();

      await fixtures.thenThrowLogoutError(promise);
      fixtures.thenSignOutCalledWithExpectedArgs();
    });
  });

  describe('createUser', () => {
    let fixtures: CreateUserFixtures;

    beforeEach(() => {
      fixtures = new CreateUserFixtures();
    });

    it('should create auth user, teacher profile and mark invitation token as used', async () => {
      fixtures.whenFullSuccessPath();

      await fixtures.whenCreateUser();

      expect(fixtures.createUserMock).toHaveBeenCalledTimes(1);
      expect(fixtures.teachersInsertMock).toHaveBeenCalledTimes(1);
      expect(fixtures.tokensUpdateMock).toHaveBeenCalledTimes(1);
      expect(fixtures.deleteUserMock).not.toHaveBeenCalled();

      expect(fixtures.tokensEqMock).toHaveBeenCalledWith(
        'id',
        fixtures.invitationToken.id,
      );
      expect(fixtures.tokensIsMock).toHaveBeenCalledWith('used_at', null);
    });

    it('should throw UserAlereadyExistsError when user is already registered', async () => {
      fixtures.whenCreateUserReturnsAlreadyRegistered();

      const promise = fixtures.whenCreateUser();

      await fixtures.thenThrowTeacherAlreadyExists(promise);
      expect(fixtures.teachersInsertMock).not.toHaveBeenCalled();
    });

    it('should throw UserCreationError on other admin createAuthUser errors', async () => {
      fixtures.whenCreateUserReturnsGenericError();

      const promise = fixtures.whenCreateUser();

      await fixtures.thenThrowUserCreationError(promise);
    });

    it('should throw UserCreationFailedError when admin response has no user', async () => {
      fixtures.whenCreateUserReturnsNoUser();

      const promise = fixtures.whenCreateUser();

      await fixtures.thenThrowTeacherCreationFailed(promise);
    });

    it('should throw TeacherProfileCreationError and delete auth user when teacher insert fails', async () => {
      fixtures.whenCreateUserSucceedsButTeacherInsertFails();

      const promise = fixtures.whenCreateUser();

      await fixtures.thenThrowTeacherProfileCreationError(promise);
      expect(fixtures.deleteUserMock).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should throw TokenUpdateError when updating invitation token fails', async () => {
      fixtures.whenCreateUserAndTeacherInsertSucceedButTokenUpdateFails();

      const promise = fixtures.whenCreateUser();

      await fixtures.thenThrowTokenUpdateError(promise);
    });
  });
});

class GetInvitationPreviewFixtures {
  public readonly token = 'token-123';

  public readonly preview: InvitationTokenPreview = {
    isValid: true,
    maskedEmail: 'j**n@acme.com',
    establishmentName: 'Edesio Academy',
    assignedChatbots: 2,
  };

  private readonly validData = {
    id: 'id-1',
    invited_email: 'john@acme.com',
    assigned_chatbots: 2,
    assignedChatbots: 2,
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    used_at: null,
    establishment: { name: 'Edesio Academy' },
  };

  private readonly singleMock = jest.fn();
  private readonly eqMock = jest.fn(() => ({ single: this.singleMock }));
  private readonly selectMock = jest.fn(() => ({ eq: this.eqMock }));
  private readonly fromMock = jest.fn(() => ({ select: this.selectMock }));

  private readonly supabaseAdminMock = {
    from: this.fromMock,
  };

  public readonly sut = new AuthSupabaseRepository(
    {} as any,
    this.supabaseAdminMock as any,
  );

  whenSupabaseReturnsData() {
    this.singleMock.mockResolvedValue({
      data: this.validData,
      error: null,
    });
  }

  whenSupabaseReturnsError() {
    this.singleMock.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });
  }

  whenTokenAlreadyUsed() {
    this.singleMock.mockResolvedValue({
      data: {
        ...this.validData,
        used_at: new Date().toISOString(),
      },
      error: null,
    });
  }

  whenTokenExpired() {
    this.singleMock.mockResolvedValue({
      data: {
        ...this.validData,
        expires_at: new Date(Date.now() - 60_000).toISOString(),
      },
      error: null,
    });
  }

  whenGetInvitationPreview() {
    return this.sut.getInvitationPreview(this.token);
  }

  thenQueryIsBuiltWithToken() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.selectMock).toHaveBeenCalled();
    expect(this.eqMock).toHaveBeenCalledWith('token', this.token);
    expect(this.singleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedPreview(result: InvitationTokenPreview) {
    expect(result).toEqual(this.preview);
  }

  async thenThrowNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(InvitationTokenNotFoundError);
  }

  async thenThrowAlreadyUsed(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(
      InvitationTokenAlreadyUsedError,
    );
    await expect(promise).rejects.toThrow('Invitation token already used');
  }

  async thenThrowExpired(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(InvitationTokenExpiredError);
    await expect(promise).rejects.toThrow('Invitation token expired');
  }
}

class LoginUserFixtures {
  public readonly emailInput = '  User@School.com  ';
  public readonly emailNormalized = 'user@school.com';
  public readonly password = 'secret123';

  public readonly signInWithPasswordMock = jest.fn();
  public readonly sut: AuthSupabaseRepository;

  public readonly sessionPayload: Session;
  public readonly expectedAuthUserWithSession: AuthUserWithSession;

  constructor() {
    const supabaseAdminMock = {
      auth: {
        signInWithPassword: this.signInWithPasswordMock,
      },
    };

    this.sut = new AuthSupabaseRepository(supabaseAdminMock as any, {} as any);

    const user: Session['user'] = {
      id: 'u1',
      aud: 'authenticated',
      role: 'authenticated',
      email: this.emailNormalized,
      email_confirmed_at: '2026-01-01T00:00:00.000Z',
      phone: '',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {
        role: 'teacher',
        firstname: 'Ada',
        lastname: 'Lovelace',
      },
      identities: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      is_anonymous: false,
      confirmed_at: '2026-01-01T00:00:00.000Z',
      last_sign_in_at: '2026-01-01T00:00:00.000Z',
    };

    const authSession: Session['session'] = {
      access_token: 'at',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: '2026-12-31T23:59:59.000Z',
      refresh_token: 'rt',
      user,
      weak_password: null,
    };

    this.sessionPayload = {
      user,
      session: authSession,
    };

    this.expectedAuthUserWithSession = {
      authUser: {
        id: 'u1',
        email: this.emailNormalized,
        emailConfirmedAt: '2026-01-01T00:00:00.000Z',
        metadata: {
          role: 'teacher',
          firstname: 'Ada',
          lastname: 'Lovelace',
          establishment: undefined,
          invitationToken: undefined,
        },
      },
      session: {
        accessToken: 'at',
        refreshToken: 'rt',
        expiresIn: 3600,
      },
    };
  }

  whenLoginUser() {
    return this.sut.loginUser(this.emailInput, this.password);
  }

  whenSignInWithPasswordSucceeds() {
    this.signInWithPasswordMock.mockResolvedValue({
      data: this.sessionPayload,
      error: null,
    });
  }

  whenSignInWithPasswordFails() {
    this.signInWithPasswordMock.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });
  }

  thenSignInWithPasswordCalledWithNormalizedEmail() {
    expect(this.signInWithPasswordMock).toHaveBeenCalledWith({
      email: this.emailNormalized,
      password: this.password,
    });
    expect(this.signInWithPasswordMock).toHaveBeenCalledTimes(1);
  }

  async thenThrowUserLoginError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(UserLoginError);
    await expect(promise).rejects.toThrow('Invalid login credentials');
  }
}

class CreateInvitationTokenFixtures {
  public readonly establishmentId = 'est-1';
  public readonly token = 'inv-token-123';
  public readonly invitedEmail = 'Teacher@School.com ';
  public readonly expiresAt = new Date('2027-01-01T00:00:00.000Z');
  public readonly assignedChatbots = 2;

  public readonly createBody = {
    establishmentId: 'est-1',
    token: 'inv-token-123',
    invitedEmail: 'Teacher@School.com ',
    expiresAt: new Date('2027-01-01T00:00:00.000Z'),
    assignedChatbots: 2,
  };

  private readonly singleMock = jest.fn();
  private readonly selectMock = jest.fn(() => ({ single: this.singleMock }));
  private readonly insertMock = jest.fn(() => ({ select: this.selectMock }));
  private readonly fromMock = jest.fn(() => ({ insert: this.insertMock }));

  private readonly supabaseAdminMock = {
    from: this.fromMock,
  };

  public readonly sut = new AuthSupabaseRepository(
    this.supabaseAdminMock as any,
    {} as any,
  );

  whenInsertSucceeds() {
    this.singleMock.mockResolvedValue({
      data: { id: 'new-token-id' },
      error: null,
    });
  }

  whenInsertFails() {
    this.singleMock.mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });
  }

  whenCreateInvitationToken() {
    return this.sut.createInvitationToken(this.createBody);
  }

  thenInsertQueryBuiltWithExpectedPayload() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.insertMock).toHaveBeenCalledWith({
      establishment_id: this.establishmentId,
      token: this.token,
      invited_email: this.invitedEmail,
      expires_at: this.expiresAt.toISOString(),
      assigned_chatbots: this.assignedChatbots,
    });
    expect(this.selectMock).toHaveBeenCalledWith();
    expect(this.singleMock).toHaveBeenCalledTimes(1);
  }

  async thenThrowInvitationTokenCreationError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(InvitationTokenCreationError);
    await expect(promise).rejects.toThrow('insert failed');
  }
}

class CreateUserFixtures {
  public readonly invitationToken: InvitationToken = {
    id: 'inv-token-id-1',
    establishment_id: 'est-1',
    token: 'tok',
    invited_email: 'teacher@school.com',
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    used_at: null,
    used_by: null,
    created_at: '2026-01-01T00:00:00.000Z',
    assigned_chatbots: 3,
  };

  public readonly createUserMock = jest.fn();
  public readonly deleteUserMock = jest.fn();

  public readonly teachersSingleMock = jest.fn();
  private readonly teachersSelectMock = jest.fn(() => ({
    single: this.teachersSingleMock,
  }));
  public readonly teachersInsertMock = jest.fn(() => ({
    select: this.teachersSelectMock,
  }));
  private readonly teachersFromMock = jest.fn(() => ({
    insert: this.teachersInsertMock,
  }));

  public readonly tokensIsMock = jest.fn();
  public readonly tokensEqMock = jest.fn(() => ({ is: this.tokensIsMock }));
  public readonly tokensUpdateMock = jest.fn(() => ({ eq: this.tokensEqMock }));
  private readonly tokensFromMock = jest.fn(() => ({
    update: this.tokensUpdateMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'teachers') {
      return this.teachersFromMock();
    }
    if (table === 'invitation_tokens') {
      return this.tokensFromMock();
    }
    return {};
  });

  private readonly supabaseAdminMock = {
    from: this.fromMock,
    auth: {
      admin: {
        createUser: this.createUserMock,
        deleteUser: this.deleteUserMock,
      },
    },
  };

  public readonly sut = new AuthSupabaseRepository(
    this.supabaseAdminMock as any,
    this.supabaseAdminMock as any,
  );

  private readonly teacherRow = {
    id: 'teacher-row-id-1',
    supabase_user_id: 'user-uuid-1',
    name: 'Jean Dupont',
    email: 'teacher@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    establishment_id: 'est-1',
    available_chatbots: 3,
  };

  whenFullSuccessPath() {
    this.createUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-uuid-1',
          email: 'teacher@school.com',
          user_metadata: {
            firstname: 'Jean',
            lastname: 'Dupont',
            role: 'teacher',
          },
        },
      },
      error: null,
    });
    this.teachersSingleMock.mockResolvedValue({
      data: this.teacherRow,
      error: null,
    });
    this.tokensIsMock.mockResolvedValue({ error: null });
  }

  whenCreateUserReturnsAlreadyRegistered() {
    this.createUserMock.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    });
  }

  whenCreateUserReturnsGenericError() {
    this.createUserMock.mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });
  }

  whenCreateUserReturnsNoUser() {
    this.createUserMock.mockResolvedValue({
      data: { user: null },
      error: null,
    });
  }

  whenCreateUserSucceedsButTeacherInsertFails() {
    this.createUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-uuid-1',
          email: 'teacher@school.com',
          user_metadata: {
            firstname: 'Jean',
            lastname: 'Dupont',
            role: 'teacher',
          },
        },
      },
      error: null,
    });
    this.teachersSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });
    this.deleteUserMock.mockResolvedValue({});
  }

  whenCreateUserAndTeacherInsertSucceedButTokenUpdateFails() {
    this.createUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-uuid-1',
          email: 'teacher@school.com',
          user_metadata: {
            firstname: 'Jean',
            lastname: 'Dupont',
            role: 'teacher',
          },
        },
      },
      error: null,
    });
    this.teachersSingleMock.mockResolvedValue({
      data: this.teacherRow,
      error: null,
    });
    this.tokensIsMock.mockResolvedValue({
      error: { message: 'update failed' },
    });
  }

  whenCreateUser() {
    return this.sut.createUser(
      'teacher@school.com',
      'secret',
      { firstname: 'Jean', lastname: 'Dupont', role: 'teacher' },
      this.invitationToken,
    );
  }

  async thenThrowTeacherAlreadyExists(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(UserAlereadyExistsError);
  }

  async thenThrowUserCreationError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(UserCreationError);
  }

  async thenThrowTeacherCreationFailed(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(UserCreationFailedError);
  }

  async thenThrowTeacherProfileCreationError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(TeacherProfileCreationError);
  }

  async thenThrowTokenUpdateError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(TokenUpdateError);
  }
}

class LogoutUserFixtures {
  public readonly accessToken = 'access-token';
  public readonly signOutMock = jest.fn();
  public readonly sut: AuthSupabaseRepository;

  constructor() {
    const supabaseAdminMock = {
      auth: {
        admin: {
          signOut: this.signOutMock,
        },
      },
    };

    this.sut = new AuthSupabaseRepository(supabaseAdminMock as any, {} as any);
  }

  whenLogoutUser() {
    return this.sut.logoutUser(this.accessToken);
  }

  whenSignOutSucceeds() {
    this.signOutMock.mockResolvedValue({
      error: null,
    });
  }

  whenSignOutFails() {
    this.signOutMock.mockResolvedValue({
      error: { message: 'logout failed' },
    });
  }

  thenSignOutCalledWithExpectedArgs() {
    expect(this.signOutMock).toHaveBeenCalledWith(this.accessToken, 'global');
    expect(this.signOutMock).toHaveBeenCalledTimes(1);
  }

  async thenThrowLogoutError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(LogoutError);
    await expect(promise).rejects.toThrow('logout failed');
  }
}
