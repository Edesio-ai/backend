import { LogoutUseCase } from './logout.use-case';
import type { IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';

describe('LogoutUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call repository logout with access token', async () => {
    fixtures.whenLogoutUserResolves();

    await fixtures.whenExecuteWith(fixtures.accessToken);

    fixtures.thenLogoutUserCalledWithAccessToken();
  });

  it('should propagate repository error when logout fails', async () => {
    fixtures.whenLogoutUserThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.accessToken);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenLogoutUserCalledWithAccessToken();
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly logoutUseCase: LogoutUseCase;

  public readonly accessToken: string;
  public readonly repositoryError: Error;

  constructor() {
    this.authRepository = createMockAuthRepository();

    this.logoutUseCase = new LogoutUseCase(this.authRepository);

    this.accessToken = 'access-token';
    this.repositoryError = new Error('logout failed');
  }

  whenExecuteWith(accessToken: string) {
    return this.logoutUseCase.execute(accessToken);
  }

  whenLogoutUserResolves() {
    this.authRepository.logoutUser.mockResolvedValue(undefined);
  }

  whenLogoutUserThrowsError() {
    this.authRepository.logoutUser.mockRejectedValue(this.repositoryError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenLogoutUserCalledWithAccessToken() {
    expect(this.authRepository.logoutUser).toHaveBeenCalledWith(this.accessToken);
    expect(this.authRepository.logoutUser).toHaveBeenCalledTimes(1);
  }
}
