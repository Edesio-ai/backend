import { LoginUseCase } from './login.use-case';
import { AuthRepository } from '../../interfaces/persistence/auth.repository';
import { AuthSession, LoginBody, Session } from '../../domain/auth/types/auth.type';

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
    fixtures.thenReturnsExpectedSession(result);
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
  public readonly authRepository: jest.Mocked<AuthRepository>;
  public readonly loginUseCase: LoginUseCase;

  public readonly loginBody: LoginBody;
  public readonly repositoryError: Error;
  public readonly authSession: AuthSession;

  constructor() {
    this.authRepository = {
      getInvitationPreview: jest.fn(),
      valideInvitationToken: jest.fn(),
      createUser: jest.fn(),
      loginUser: jest.fn(),
      validateToken: jest.fn(),
    };

    this.loginUseCase = new LoginUseCase(this.authRepository);

    this.loginBody = {
      email: 'user@school.com',
      password: 'Secret123!@#',
    };

    this.repositoryError = new Error('Invalid login credentials');

    this.authSession = {
      access_token: 'access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: '2026-01-01T12:00:00.000Z',
      refresh_token: 'refresh-token',
      user: {
        id: 'user-1',
        aud: 'authenticated',
        role: 'authenticated',
        email: this.loginBody.email,
        email_confirmed_at: '2026-01-01T00:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        identities: [],
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        is_anonymous: false,
        confirmed_at: '2026-01-01T00:00:00.000Z',
        last_sign_in_at: '2026-01-01T00:00:00.000Z',
      },
      weak_password: null,
    };
  }

  whenExecuteWith(body: LoginBody) {
    return this.loginUseCase.execute(body);
  }

  whenLoginUserReturnsSession() {
    const sessionPayload: Session = {
      user: this.authSession.user,
      session: this.authSession,
    };
    this.authRepository.loginUser.mockResolvedValue(sessionPayload);
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

  thenReturnsExpectedSession(result: AuthSession) {
    expect(result).toEqual(this.authSession);
  }
}
