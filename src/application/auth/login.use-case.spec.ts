import { LoginUseCase } from './login.use-case';
import { IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import {
  AuthUserWithSession,
  LoginBody,
} from '../../domain/auth/types/auth.type';

describe('LoginUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return auth session when login succeeds', async () => {
    fixtures.whenLoginUserReturnsSession();

    const result = await fixtures.whenExecuteWith(fixtures.loginBody);

    fixtures.thenLoginUserCalledWith(
      fixtures.loginBody.email,
      fixtures.loginBody.password,
    );
    fixtures.thenReturnsExpectedAuthUserWithSession(result);
  });

  it('should propagate repository error when login fails', async () => {
    fixtures.whenLoginUserThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.loginBody);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenLoginUserCalledWith(
      fixtures.loginBody.email,
      fixtures.loginBody.password,
    );
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly loginUseCase: LoginUseCase;

  public readonly loginBody: LoginBody;
  public readonly repositoryError: Error;
  public readonly authUserWithSession: AuthUserWithSession;

  constructor() {
    this.authRepository = {
      createAuthUser: jest.fn(),
      loginUser: jest.fn(),
      validateToken: jest.fn(),
      logoutUser: jest.fn(),
    };

    this.loginUseCase = new LoginUseCase(this.authRepository);

    this.loginBody = {
      email: 'user@school.com',
      password: 'Secret123!@#',
    };

    this.repositoryError = new Error('Invalid login credentials');

    this.authUserWithSession = {
      authUser: {
        id: 'user-1',
        email: this.loginBody.email,
        emailConfirmedAt: '2026-01-01T00:00:00.000Z',
        metadata: {
          role: 'teacher',
          firstname: 'Ada',
          lastname: 'Lovelace',
        },
      },
      session: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      },
    };
  }

  whenExecuteWith(body: LoginBody) {
    return this.loginUseCase.execute(body);
  }

  whenLoginUserReturnsSession() {
    this.authRepository.loginUser.mockResolvedValue(this.authUserWithSession);
  }

  whenLoginUserThrowsError() {
    this.authRepository.loginUser.mockRejectedValue(this.repositoryError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenLoginUserCalledWith(email: string, password: string) {
    expect(this.authRepository.loginUser).toHaveBeenCalledWith(email, password);
    expect(this.authRepository.loginUser).toHaveBeenCalledTimes(1);
  }

  thenReturnsExpectedAuthUserWithSession(result: AuthUserWithSession) {
    expect(result).toEqual(this.authUserWithSession);
  }
}
