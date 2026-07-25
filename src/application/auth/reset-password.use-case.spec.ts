import { ResetPasswordUseCase } from './reset-password.use-case';
import type { IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';

describe('ResetPasswordUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delegate to resetPasswordByEmail', async () => {
    fixtures.whenResetPasswordByEmailResolves();

    await fixtures.whenExecute();

    expect(fixtures.authRepository.resetPasswordByEmail).toHaveBeenCalledWith(fixtures.email);
    expect(fixtures.authRepository.resetPasswordByEmail).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const err = new Error('SMTP failure');
    fixtures.whenResetPasswordByEmailRejects(err);

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly useCase: ResetPasswordUseCase;

  public readonly email = 'teacher@school.com';

  constructor() {
    this.authRepository = createMockAuthRepository();
    this.useCase = new ResetPasswordUseCase(this.authRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.email);
  }

  whenResetPasswordByEmailResolves() {
    this.authRepository.resetPasswordByEmail.mockResolvedValue(undefined);
  }

  whenResetPasswordByEmailRejects(error: Error) {
    this.authRepository.resetPasswordByEmail.mockRejectedValue(error);
  }
}
