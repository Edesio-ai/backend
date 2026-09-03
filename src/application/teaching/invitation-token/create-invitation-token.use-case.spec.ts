import { InvitationEmailAlreadyRegisteredError } from 'src/domain/shared/errors/global.errors';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';
import { createMockInvitationTokenRepository } from 'src/testing/mock-invitation-token-repository';
import type { IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import type { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { CreateInvitationTokenBody, CreateInvitationTokenUseCase } from './create-invitation-token.use-case';

describe('CreateInvitationTokenUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create invitation token when email is not registered', async () => {
    fixtures.givenEmailIsNotRegistered();
    fixtures.whenCreateInvitationTokenResolves();

    await fixtures.whenExecuteWith(fixtures.body);

    fixtures.thenExistsUserByEmailCalled();
    fixtures.thenCreateInvitationTokenCalledWithExpectedArguments();
  });

  it('should throw InvitationEmailAlreadyRegisteredError when email is already registered', async () => {
    fixtures.givenEmailIsRegistered();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowInvitationEmailAlreadyRegistered(promise);
    fixtures.thenExistsUserByEmailCalled();
    fixtures.thenCreateInvitationTokenNotCalled();
  });

  it('should propagate repository error', async () => {
    fixtures.givenEmailIsNotRegistered();
    fixtures.whenCreateInvitationTokenThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenExistsUserByEmailCalled();
    fixtures.thenCreateInvitationTokenCalledWithExpectedArguments();
  });

  it('should propagate existsUserByEmail error', async () => {
    fixtures.whenExistsUserByEmailThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenExistsUserByEmailCalled();
    fixtures.thenCreateInvitationTokenNotCalled();
  });
});

class Fixtures {
  public readonly invitationTokenRepository: jest.Mocked<IInvitationTokenRepository>;
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly createInvitationTokenUseCase: CreateInvitationTokenUseCase;

  public readonly body: CreateInvitationTokenBody;
  public readonly repositoryError: Error;

  constructor() {
    this.invitationTokenRepository = createMockInvitationTokenRepository();
    this.authRepository = createMockAuthRepository();

    this.createInvitationTokenUseCase = new CreateInvitationTokenUseCase(
      this.invitationTokenRepository,
      this.authRepository,
    );

    this.body = {
      establishmentId: 'est-1',
      token: 'token-123',
      invitedEmail: 'teacher@school.com',
      expiresAt: new Date('2026-12-31T12:00:00.000Z'),
      assignedChatbots: 3,
    };
    this.repositoryError = new Error('repository failed');
  }

  givenEmailIsNotRegistered() {
    this.authRepository.existsUserByEmail.mockResolvedValue(false);
  }

  givenEmailIsRegistered() {
    this.authRepository.existsUserByEmail.mockResolvedValue(true);
  }

  whenExecuteWith(body: CreateInvitationTokenBody) {
    return this.createInvitationTokenUseCase.execute(body);
  }

  whenCreateInvitationTokenResolves() {
    this.invitationTokenRepository.createInvitationToken.mockResolvedValue(undefined);
  }

  whenCreateInvitationTokenThrowsError() {
    this.invitationTokenRepository.createInvitationToken.mockRejectedValue(this.repositoryError);
  }

  whenExistsUserByEmailThrowsError() {
    this.authRepository.existsUserByEmail.mockRejectedValue(this.repositoryError);
  }

  async thenThrowInvitationEmailAlreadyRegistered(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(InvitationEmailAlreadyRegisteredError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenExistsUserByEmailCalled() {
    expect(this.authRepository.existsUserByEmail).toHaveBeenCalledWith(this.body.invitedEmail);
    expect(this.authRepository.existsUserByEmail).toHaveBeenCalledTimes(1);
  }

  thenCreateInvitationTokenCalledWithExpectedArguments() {
    expect(this.invitationTokenRepository.createInvitationToken).toHaveBeenCalledWith(this.body);
    expect(this.invitationTokenRepository.createInvitationToken).toHaveBeenCalledTimes(1);
  }

  thenCreateInvitationTokenNotCalled() {
    expect(this.invitationTokenRepository.createInvitationToken).not.toHaveBeenCalled();
  }
}
