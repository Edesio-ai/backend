import { GetUserSessionUseCase } from './get-user-session.use-case';
import type { IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';
import { User } from '../../domain/auth/types/auth.type';

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
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly getUserSessionUseCase: GetUserSessionUseCase;

  public readonly token: string;
  public readonly repositoryError: Error;
  public readonly user: User;

  constructor() {
    this.authRepository = createMockAuthRepository();

    this.getUserSessionUseCase = new GetUserSessionUseCase(this.authRepository);

    this.token = 'access-token';
    this.repositoryError = new Error('Invalid token');
    this.user = {
      id: 'user-1',
      email: 'user@school.com',
      metadata: {
        role: 'establishment',
        firstname: 'John',
        lastname: 'Doe',
      },
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

  thenReturnsExpectedUser(result: User) {
    expect(result).toEqual(this.user);
  }
}
