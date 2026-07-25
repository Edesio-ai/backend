import { CreateInvitationTokenBody, CreateInvitationTokenUseCase } from './create-invitation-token.use-case';
import type { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';

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
  public readonly invitationTokenRepository: jest.Mocked<IInvitationTokenRepository>;
  public readonly createInvitationTokenUseCase: CreateInvitationTokenUseCase;

  public readonly body: CreateInvitationTokenBody;
  public readonly repositoryError: Error;

  constructor() {
    this.invitationTokenRepository = {
      deleteInvitationToken: jest.fn(),
      getInvitationByToken: jest.fn(),
      markInvitationTokenAsUsed: jest.fn(),
      getInvitationTokenByEstablishmentId: jest.fn(),
      createInvitationToken: jest.fn(),
      getInvitationPreview: jest.fn(),
      updateTokenUsedAt: jest.fn(),
    };

    this.createInvitationTokenUseCase = new CreateInvitationTokenUseCase(this.invitationTokenRepository);

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
    this.invitationTokenRepository.createInvitationToken.mockResolvedValue(undefined);
  }

  whenCreateInvitationTokenThrowsError() {
    this.invitationTokenRepository.createInvitationToken.mockRejectedValue(this.repositoryError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenCreateInvitationTokenCalledWithExpectedArguments() {
    expect(this.invitationTokenRepository.createInvitationToken).toHaveBeenCalledWith(this.body);
    expect(this.invitationTokenRepository.createInvitationToken).toHaveBeenCalledTimes(1);
  }
}
