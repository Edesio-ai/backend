import { UpdatePasswordUseCase } from './update-password.use-case';
import type { IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';

describe('UpdatePasswordUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delegate password update to the repository', async () => {
    fixtures.whenUpdateAuthUserResolves();

    await fixtures.whenExecute();

    expect(fixtures.authRepository.updateAuthUser).toHaveBeenCalledWith(
      fixtures.userId,
      { password: fixtures.newPassword },
    );
    expect(fixtures.authRepository.updateAuthUser).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const err = new Error('weak password');
    fixtures.whenUpdateAuthUserRejects(err);

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly useCase: UpdatePasswordUseCase;

  public readonly userId = 'user-uuid-1';
  public readonly newPassword = 'SecurePass12!Extra';

  constructor() {
    this.authRepository = createMockAuthRepository();
    this.useCase = new UpdatePasswordUseCase(this.authRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.newPassword);
  }

  whenUpdateAuthUserResolves() {
    this.authRepository.updateAuthUser.mockResolvedValue(undefined);
  }

  whenUpdateAuthUserRejects(error: Error) {
    this.authRepository.updateAuthUser.mockRejectedValue(error);
  }
}
