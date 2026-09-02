import { GetUserSessionUseCase } from './get-user-session.use-case';
import type { IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';
import { TokenUserNotFoundError } from '../../domain/auth/errors/auth.errors';
import { AuthUserWithSession, User } from '../../domain/auth/types/auth.type';

describe('GetUserSessionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return user when access token is valid', async () => {
    fixtures.whenValidateTokenReturnsUser();

    const result = await fixtures.whenExecuteWith(fixtures.accessToken);

    fixtures.thenValidateTokenCalledWith(fixtures.accessToken);
    fixtures.thenReturnsUserWithoutRefresh(result);
  });

  it('should refresh session when access token is expired and refresh token is present', async () => {
    fixtures.whenValidateTokenThrowsExpired();
    fixtures.whenRefreshSessionSucceeds();

    const result = await fixtures.whenExecuteWith(fixtures.accessToken, fixtures.refreshToken);

    expect(fixtures.authRepository.refreshSession).toHaveBeenCalledWith(fixtures.refreshToken);
    fixtures.thenReturnsRefreshedSession(result);
  });

  it('should return null when access token is expired and no refresh token is present', async () => {
    fixtures.whenValidateTokenThrowsExpired();

    const result = await fixtures.whenExecuteWith(fixtures.accessToken);

    expect(result).toEqual({ user: null, refreshedSession: null });
    expect(fixtures.authRepository.refreshSession).not.toHaveBeenCalled();
  });

  it('should return null when access token is expired and refresh fails', async () => {
    fixtures.whenValidateTokenThrowsExpired();
    fixtures.whenRefreshSessionFails();

    const result = await fixtures.whenExecuteWith(fixtures.accessToken, fixtures.refreshToken);

    expect(result).toEqual({ user: null, refreshedSession: null });
  });

  it('should return null when no tokens are provided', async () => {
    const result = await fixtures.whenExecuteWith();

    expect(result).toEqual({ user: null, refreshedSession: null });
    expect(fixtures.authRepository.validateToken).not.toHaveBeenCalled();
    expect(fixtures.authRepository.refreshSession).not.toHaveBeenCalled();
  });

  it('should propagate unexpected validation errors', async () => {
    fixtures.whenValidateTokenThrowsUnexpected();

    await expect(fixtures.whenExecuteWith(fixtures.accessToken)).rejects.toBe(fixtures.unexpectedError);
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly getUserSessionUseCase: GetUserSessionUseCase;

  public readonly accessToken = 'access-token';
  public readonly refreshToken = 'refresh-token';
  public readonly unexpectedError = new Error('boom');
  public readonly user: User = {
    id: 'user-1',
    email: 'user@school.com',
    metadata: {
      role: 'establishment',
      firstname: 'John',
      lastname: 'Doe',
    },
  };
  public readonly refreshed: AuthUserWithSession = {
    authUser: {
      id: 'user-1',
      email: 'user@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: {
        role: 'establishment',
        firstname: 'John',
        lastname: 'Doe',
      },
    },
    session: {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      expiresIn: 3600,
    },
  };

  constructor() {
    this.authRepository = createMockAuthRepository();
    this.getUserSessionUseCase = new GetUserSessionUseCase(this.authRepository);
  }

  whenExecuteWith(accessToken?: string, refreshToken?: string) {
    return this.getUserSessionUseCase.execute(accessToken, refreshToken);
  }

  whenValidateTokenReturnsUser() {
    this.authRepository.validateToken.mockResolvedValue(this.user);
  }

  whenValidateTokenThrowsExpired() {
    this.authRepository.validateToken.mockRejectedValue(new TokenUserNotFoundError('token is expired'));
  }

  whenValidateTokenThrowsUnexpected() {
    this.authRepository.validateToken.mockRejectedValue(this.unexpectedError);
  }

  whenRefreshSessionSucceeds() {
    this.authRepository.refreshSession.mockResolvedValue(this.refreshed);
  }

  whenRefreshSessionFails() {
    this.authRepository.refreshSession.mockRejectedValue(
      new TokenUserNotFoundError('Invalid or expired refresh token'),
    );
  }

  thenValidateTokenCalledWith(token: string) {
    expect(this.authRepository.validateToken).toHaveBeenCalledWith(token);
    expect(this.authRepository.validateToken).toHaveBeenCalledTimes(1);
  }

  thenReturnsUserWithoutRefresh(result: Awaited<ReturnType<GetUserSessionUseCase['execute']>>) {
    expect(result).toEqual({ user: this.user, refreshedSession: null });
  }

  thenReturnsRefreshedSession(result: Awaited<ReturnType<GetUserSessionUseCase['execute']>>) {
    expect(result).toEqual({
      user: {
        id: this.refreshed.authUser.id,
        email: this.refreshed.authUser.email,
        emailConfirmedAt: this.refreshed.authUser.emailConfirmedAt,
        metadata: this.refreshed.authUser.metadata,
      },
      refreshedSession: this.refreshed.session,
    });
  }
}
