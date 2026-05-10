import {
  CreateInvitationTokenBody,
  CreateInvitationTokenUseCase,
} from './create-invitation-token.use-case';
import { IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';

describe('CreateInvitationTokenUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create invitation token with expected payload', async () => {
    fixtures.whenCreateInvitationTokenResolves();

    await fixtures.whenExecuteWith(fixtures.body);

    fixtures.thenCreateInvitationTokenCalledWithExpectedArguments();
  });

  it('should propagate repository error', async () => {
    fixtures.whenCreateInvitationTokenThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenCreateInvitationTokenCalledWithExpectedArguments();
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly createInvitationTokenUseCase: CreateInvitationTokenUseCase;

  public readonly body: CreateInvitationTokenBody;
  public readonly repositoryError: Error;

  constructor() {
    this.authRepository = {
      getInvitationPreview: jest.fn(),
      createUser: jest.fn(),
      loginUser: jest.fn(),
      validateToken: jest.fn(),
      logoutUser: jest.fn(),
      createInvitationToken: jest.fn(),
    };

    this.createInvitationTokenUseCase = new CreateInvitationTokenUseCase(
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

  whenExecuteWith(body: CreateInvitationTokenBody) {
    return this.createInvitationTokenUseCase.execute(body);
  }

  whenCreateInvitationTokenResolves() {
    this.authRepository.createInvitationToken.mockResolvedValue(undefined);
  }

  whenCreateInvitationTokenThrowsError() {
    this.authRepository.createInvitationToken.mockRejectedValue(
      this.repositoryError,
    );
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenCreateInvitationTokenCalledWithExpectedArguments() {
    expect(this.authRepository.createInvitationToken).toHaveBeenCalledWith(
      this.body,
    );
    expect(this.authRepository.createInvitationToken).toHaveBeenCalledTimes(1);
  }
}
