import { GetUserSessionUseCase } from './get-user-session.use-case';
import { AuthRepository } from '../../domain/auth/contract/auth.repository';
import { SupabaseUser } from '../../domain/auth/types/auth.type';

describe('GetUserSessionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return user when token is valid', async () => {
    fixtures.whenValidateTokenReturnsUser();

    const result = await fixtures.whenExecuteWith(fixtures.token);

    fixtures.thenValidateTokenCalledWith(fixtures.token);
    fixtures.thenReturnsExpectedUser(result);
  });

  it('should propagate repository error when token validation fails', async () => {
    fixtures.whenValidateTokenThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.token);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenValidateTokenCalledWith(fixtures.token);
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<AuthRepository>;
  public readonly getUserSessionUseCase: GetUserSessionUseCase;

  public readonly token: string;
  public readonly repositoryError: Error;
  public readonly user: SupabaseUser;

  constructor() {
    this.authRepository = {
      getInvitationPreview: jest.fn(),
      createUser: jest.fn(),
      loginUser: jest.fn(),
      validateToken: jest.fn(),
      logoutUser: jest.fn(),
      createInvitationToken: jest.fn(),
    };

    this.getUserSessionUseCase = new GetUserSessionUseCase(this.authRepository);

    this.token = 'access-token';
    this.repositoryError = new Error('Invalid token');
    this.user = {
      id: 'user-1',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'user@school.com',
      email_confirmed_at: '2026-01-01T00:00:00.000Z',
      phone: '',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {
        role: 'establishment',
        firstname: 'John',
        lastname: 'Doe',
      },
      identities: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      is_anonymous: false,
    };
  }

  whenExecuteWith(token: string) {
    return this.getUserSessionUseCase.execute(token);
  }

  whenValidateTokenReturnsUser() {
    this.authRepository.validateToken.mockResolvedValue(this.user);
  }

  whenValidateTokenThrowsError() {
    this.authRepository.validateToken.mockRejectedValue(this.repositoryError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenValidateTokenCalledWith(token: string) {
    expect(this.authRepository.validateToken).toHaveBeenCalledWith(token);
    expect(this.authRepository.validateToken).toHaveBeenCalledTimes(1);
  }

  thenReturnsExpectedUser(result: SupabaseUser) {
    expect(result).toEqual(this.user);
  }
}
