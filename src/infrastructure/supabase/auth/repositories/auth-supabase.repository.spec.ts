import { SupabaseClient } from '@supabase/supabase-js';
import { AuthSupabaseRepository } from './auth-supabase.repository';
import { AuthMapper } from '../mappers/auth.mappers';
import { BadRequestError, ServerError, UnauthorizedError } from '../../../../domain/shared/errors/global.errors';
import { AuthUserWithSession, SupabaseAuthSession } from '../../../../domain/auth/types/auth.type';
import { TokenUserNotFoundError } from '../../../../domain/auth/errors/auth.errors';

describe('AuthSupabaseRepository', () => {
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

    it('should throw UnauthorizedError when signInWithPassword returns error', async () => {
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

    it('should throw ServerError when signOut returns error', async () => {
      fixtures.whenSignOutFails();

      const promise = fixtures.whenLogoutUser();

      await fixtures.thenThrowLogoutError(promise);
      fixtures.thenSignOutCalledWithExpectedArgs();
    });
  });

  describe('createAuthUser', () => {
    let fixtures: CreateAuthUserFixtures;

    beforeEach(() => {
      fixtures = new CreateAuthUserFixtures();
    });

    it('should create user and map result to domain User', async () => {
      fixtures.whenAdminCreateUserSucceeds();

      const result = await fixtures.whenCreateAuthUser();

      expect(fixtures.createUserMock).toHaveBeenCalledWith({
        email: fixtures.emailNormalized,
        password: fixtures.password,
        email_confirm: true,
        user_metadata: fixtures.metadata,
      });

      expect(result).toEqual({
        id: 'user-uuid-1',
        email: 'teacher@school.com',
        metadata: {
          firstname: 'Jean',
          lastname: 'Dupont',
        },
      });
    });

    it('should throw BadRequestError when user is already registered', async () => {
      fixtures.whenCreateUserReturnsAlreadyRegistered();

      const promise = fixtures.whenCreateAuthUser();

      await fixtures.thenThrowUserAlreadyExists(promise);
    });

    it('should throw ServerError on other admin createUser errors', async () => {
      fixtures.whenCreateUserReturnsGenericError();

      const promise = fixtures.whenCreateAuthUser();

      await fixtures.thenThrowUserCreationError(promise);
    });

    it('should throw ServerError when admin response has no user', async () => {
      fixtures.whenCreateUserReturnsNoUser();

      const promise = fixtures.whenCreateAuthUser();

      await fixtures.thenThrowUserCreationFailed(promise);
    });
  });

  describe('updateAuthUser', () => {
    let fixtures: UpdateAuthUserFixtures;

    beforeEach(() => {
      fixtures = new UpdateAuthUserFixtures();
    });

    it('should call admin.updateUserById with email and user_metadata', async () => {
      fixtures.whenUpdateUserByIdSucceeds();

      await fixtures.whenUpdateAuthUser();

      expect(fixtures.updateUserByIdMock).toHaveBeenCalledWith(
        fixtures.userId,
        AuthMapper.toUpdateAuthUser(fixtures.profilePayload),
      );
      expect(fixtures.updateUserByIdMock).toHaveBeenCalledTimes(1);
    });

    it('should call admin.updateUserById with password when updating password', async () => {
      fixtures.whenUpdateUserByIdSucceeds();

      await fixtures.whenUpdateAuthUserPassword();

      expect(fixtures.updateUserByIdMock).toHaveBeenCalledWith(
        fixtures.userId,
        AuthMapper.toUpdateAuthUser({ password: fixtures.newPassword }),
      );
      expect(fixtures.updateUserByIdMock).toHaveBeenCalledTimes(1);
    });

    it('should throw ServerError when updateUserById returns error', async () => {
      fixtures.whenUpdateUserByIdFails();

      await expect(fixtures.whenUpdateAuthUser()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('resetPasswordByEmail', () => {
    let fixtures: ResetPasswordByEmailFixtures;
    let originalFrontendUrl: string | undefined;

    beforeEach(() => {
      originalFrontendUrl = process.env.FRONTEND_URL;
      process.env.FRONTEND_URL = 'http://localhost:3000';
      fixtures = new ResetPasswordByEmailFixtures();
    });

    afterEach(() => {
      if (originalFrontendUrl === undefined) {
        delete process.env.FRONTEND_URL;
      } else {
        process.env.FRONTEND_URL = originalFrontendUrl;
      }
    });

    it('should call resetPasswordForEmail with redirectTo built from FRONTEND_URL', async () => {
      fixtures.whenResetPasswordForEmailSucceeds();

      await fixtures.whenResetPasswordByEmail();

      fixtures.thenResetPasswordForEmailCalledWithRedirect();
    });

    it('should throw ServerError when resetPasswordForEmail returns error', async () => {
      fixtures.whenResetPasswordForEmailFails();

      const promise = fixtures.whenResetPasswordByEmail();

      await expect(promise).rejects.toBeInstanceOf(ServerError);
      await expect(promise).rejects.toThrow('rate limited');
      expect(fixtures.resetPasswordForEmailMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshSession', () => {
    let fixtures: RefreshSessionFixtures;

    beforeEach(() => {
      fixtures = new RefreshSessionFixtures();
    });

    it('should return auth user with session when refresh succeeds', async () => {
      fixtures.whenRefreshSucceeds();

      const result = await fixtures.whenRefreshSession();

      expect(fixtures.refreshSessionMock).toHaveBeenCalledWith({
        refresh_token: fixtures.refreshToken,
      });
      expect(result).toEqual(fixtures.expectedAuthUserWithSession);
    });

    it('should throw TokenUserNotFoundError when refresh fails', async () => {
      fixtures.whenRefreshFails();

      await expect(fixtures.whenRefreshSession()).rejects.toBeInstanceOf(TokenUserNotFoundError);
    });
  });
});

class LoginUserFixtures {
  public readonly emailInput = '  User@School.com  ';
  public readonly emailNormalized = 'user@school.com';
  public readonly password = 'secret123';

  public readonly signInWithPasswordMock = jest.fn();
  public readonly sut: AuthSupabaseRepository;

  public readonly sessionPayload: SupabaseAuthSession;
  public readonly expectedAuthUserWithSession: AuthUserWithSession;

  constructor() {
    const supabaseAuthMock = {
      auth: {
        signInWithPassword: this.signInWithPasswordMock,
      },
    };

    this.sut = new AuthSupabaseRepository(supabaseAuthMock as unknown as SupabaseClient);

    const user: SupabaseAuthSession['user'] = {
      id: 'u1',
      email: this.emailNormalized,
      email_confirmed_at: '2026-01-01T00:00:00.000Z',
      user_metadata: {
        role: 'teacher',
        firstname: 'Ada',
        lastname: 'Lovelace',
      },
      confirmed_at: '2026-01-01T00:00:00.000Z',
      last_sign_in_at: '2026-01-01T00:00:00.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };

    const authSession: SupabaseAuthSession['session'] = {
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
    await expect(promise).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(promise).rejects.toThrow('Invalid login credentials');
  }
}

class CreateAuthUserFixtures {
  public readonly email = 'Teacher@School.com ';
  public readonly emailNormalized = 'teacher@school.com';
  public readonly password = 'secret';

  public readonly metadata = {
    firstname: 'Jean',
    lastname: 'Dupont',
    role: 'teacher' as const,
    acceptTerms: true,
  };

  public readonly createUserMock = jest.fn();

  public readonly sut: AuthSupabaseRepository;

  constructor() {
    const supabaseAuthMock = {
      auth: {
        admin: {
          createUser: this.createUserMock,
        },
      },
    };

    this.sut = new AuthSupabaseRepository(supabaseAuthMock as unknown as SupabaseClient);
  }

  whenAdminCreateUserSucceeds() {
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
  }

  whenCreateUserReturnsAlreadyRegistered() {
    this.createUserMock.mockResolvedValue({
      data: null,
      error: { message: 'already registered somewhere' },
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

  whenCreateAuthUser() {
    return this.sut.createAuthUser(this.email, this.password, this.metadata);
  }

  async thenThrowUserAlreadyExists(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(BadRequestError);
    await expect(promise).rejects.toThrow('User already exists');
  }

  async thenThrowUserCreationError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
    await expect(promise).rejects.toThrow('Network error');
  }

  async thenThrowUserCreationFailed(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
    await expect(promise).rejects.toThrow('User creation failed');
  }
}

class UpdateAuthUserFixtures {
  public readonly userId = 'user-update-1';
  public readonly profilePayload = {
    email: 'new@school.com',
    metadata: {
      role: 'teacher',
      firstname: 'Ann',
      lastname: 'Other',
    },
  };

  public readonly newPassword = 'NewSecure1!ExtraLong';

  public readonly updateUserByIdMock = jest.fn();
  public readonly sut: AuthSupabaseRepository;

  constructor() {
    const supabaseAuthMock = {
      auth: {
        admin: {
          updateUserById: this.updateUserByIdMock,
        },
      },
    };

    this.sut = new AuthSupabaseRepository(supabaseAuthMock as unknown as SupabaseClient);
  }

  whenUpdateAuthUser() {
    return this.sut.updateAuthUser(this.userId, this.profilePayload);
  }

  whenUpdateAuthUserPassword() {
    return this.sut.updateAuthUser(this.userId, { password: this.newPassword });
  }

  whenUpdateUserByIdSucceeds() {
    this.updateUserByIdMock.mockResolvedValue({
      data: { user: {} },
      error: null,
    });
  }

  whenUpdateUserByIdFails() {
    this.updateUserByIdMock.mockResolvedValue({
      data: null,
      error: { message: 'update user failed' },
    });
  }
}

class LogoutUserFixtures {
  public readonly accessToken = 'access-token';
  public readonly signOutMock = jest.fn();
  public readonly sut: AuthSupabaseRepository;

  constructor() {
    const supabaseAuthMock = {
      auth: {
        admin: {
          signOut: this.signOutMock,
        },
      },
    };

    this.sut = new AuthSupabaseRepository(supabaseAuthMock as unknown as SupabaseClient);
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
    await expect(promise).rejects.toBeInstanceOf(ServerError);
    await expect(promise).rejects.toThrow('logout failed');
  }
}

class ResetPasswordByEmailFixtures {
  public readonly email = 'user@school.com';
  public readonly resetPasswordForEmailMock = jest.fn();
  public readonly sut: AuthSupabaseRepository;

  constructor() {
    const supabaseAuthMock = {
      auth: {
        resetPasswordForEmail: this.resetPasswordForEmailMock,
      },
    };

    this.sut = new AuthSupabaseRepository(supabaseAuthMock as unknown as SupabaseClient);
  }

  whenResetPasswordByEmail() {
    return this.sut.resetPasswordByEmail(this.email);
  }

  whenResetPasswordForEmailSucceeds() {
    this.resetPasswordForEmailMock.mockResolvedValue({ error: null });
  }

  whenResetPasswordForEmailFails() {
    this.resetPasswordForEmailMock.mockResolvedValue({
      error: { message: 'rate limited' },
    });
  }

  thenResetPasswordForEmailCalledWithRedirect() {
    expect(this.resetPasswordForEmailMock).toHaveBeenCalledWith(this.email, {
      redirectTo: 'http://localhost:3000/reset-password',
    });
    expect(this.resetPasswordForEmailMock).toHaveBeenCalledTimes(1);
  }
}

class RefreshSessionFixtures {
  public readonly refreshToken = 'refresh-token';
  public readonly refreshSessionMock = jest.fn();
  public readonly sut: AuthSupabaseRepository;
  public readonly expectedAuthUserWithSession: AuthUserWithSession;

  constructor() {
    const supabaseAuthMock = {
      auth: {
        refreshSession: this.refreshSessionMock,
      },
    };

    this.sut = new AuthSupabaseRepository(supabaseAuthMock as unknown as SupabaseClient);

    this.expectedAuthUserWithSession = {
      authUser: {
        id: 'u1',
        email: 'user@school.com',
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
        accessToken: 'new-at',
        refreshToken: 'new-rt',
        expiresIn: 3600,
      },
    };
  }

  whenRefreshSession() {
    return this.sut.refreshSession(this.refreshToken);
  }

  whenRefreshSucceeds() {
    const user = {
      id: 'u1',
      email: 'user@school.com',
      email_confirmed_at: '2026-01-01T00:00:00.000Z',
      user_metadata: {
        role: 'teacher',
        firstname: 'Ada',
        lastname: 'Lovelace',
      },
      confirmed_at: '2026-01-01T00:00:00.000Z',
      last_sign_in_at: '2026-01-01T00:00:00.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };

    this.refreshSessionMock.mockResolvedValue({
      data: {
        session: {
          access_token: 'new-at',
          refresh_token: 'new-rt',
          expires_in: 3600,
          expires_at: '2026-12-31T23:59:59.000Z',
          token_type: 'bearer',
          user,
          weak_password: null,
        },
        user,
      },
      error: null,
    });
  }

  whenRefreshFails() {
    this.refreshSessionMock.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid Refresh Token: Already Used' },
    });
  }
}
