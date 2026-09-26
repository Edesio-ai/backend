import { GetInvitationTokenUseCase } from './get-invitation-token.use-case';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import type { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';

describe('GetInvitationTokenUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return invitation tokens when establishment id is valid', async () => {
    fixtures.whenRepositoryReturnsInvitationTokens();

    const result = await fixtures.whenExecuteWith(fixtures.establishmentId);

    fixtures.thenRepositoryCalledWithEstablishmentId();
    fixtures.thenReturnExpectedInvitationTokens(result);
  });

  it('should throw NotFoundError when establishment id is empty', async () => {
    const promise = fixtures.whenExecuteWith('');

    await fixtures.thenThrowNotFoundForEmptyEstablishmentId(promise);
    fixtures.thenRepositoryNotCalled();
  });

  it('should propagate repository error', async () => {
    fixtures.whenRepositoryThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.establishmentId);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenRepositoryCalledWithEstablishmentId();
  });
});

class Fixtures {
  public readonly invitationTokenRepository: jest.Mocked<IInvitationTokenRepository>;
  public readonly getInvitationTokenUseCase: GetInvitationTokenUseCase;

  public readonly establishmentId: string;
  public readonly invitationTokens: InvitationToken[];
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

    this.getInvitationTokenUseCase = new GetInvitationTokenUseCase(this.invitationTokenRepository);

    this.establishmentId = 'est-1';
    this.invitationTokens = [
      {
        id: 'token-id-1',
        establishmentId: this.establishmentId,
        token: 'token-abc',
        firstname: 'Camille',
        lastname: 'Bernard',
        invitedEmail: 'teacher@school.com',
        expiresAt: '2026-04-01T00:00:00.000Z',
        usedAt: null,
        usedBy: null,
        createdAt: '2026-03-28T00:00:00.000Z',
        assignedChatbots: 2,
      },
    ];
    this.repositoryError = new Error('query failed');
  }

  whenExecuteWith(establishmentId: string) {
    return this.getInvitationTokenUseCase.execute(establishmentId);
  }

  whenRepositoryReturnsInvitationTokens() {
    this.invitationTokenRepository.getInvitationTokenByEstablishmentId.mockResolvedValue(this.invitationTokens);
  }

  whenRepositoryThrowsError() {
    this.invitationTokenRepository.getInvitationTokenByEstablishmentId.mockRejectedValue(this.repositoryError);
  }

  async thenThrowNotFoundForEmptyEstablishmentId(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenRepositoryCalledWithEstablishmentId() {
    expect(this.invitationTokenRepository.getInvitationTokenByEstablishmentId).toHaveBeenCalledWith(
      this.establishmentId,
    );
    expect(this.invitationTokenRepository.getInvitationTokenByEstablishmentId).toHaveBeenCalledTimes(1);
  }

  thenRepositoryNotCalled() {
    expect(this.invitationTokenRepository.getInvitationTokenByEstablishmentId).not.toHaveBeenCalled();
  }

  thenReturnExpectedInvitationTokens(result: InvitationToken[]) {
    expect(result).toEqual(this.invitationTokens);
  }
}
