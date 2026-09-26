import { GetInvitationPreviewUseCase } from './get-invitation-preview.use-case';
import { InvitationTokenPreview } from 'src/domain/auth/invitation.type';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import type { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';

describe('GetInvitationPreviewUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when token is empty', async () => {
    const promise = fixtures.whenExecuteWith('');

    await fixtures.thenThrowBadRequest(promise);
    fixtures.thenRepositoryNotCalled();
  });

  it('should return preview when token is valid', async () => {
    fixtures.whenRepositoryReturnsPreview();
    const result = await fixtures.whenExecuteWith('token-123');

    fixtures.thenRepositoryCalledWith('token-123');
    fixtures.thenReturnExpectedPreview(result);
  });

  it('should propagate repository errors', async () => {
    fixtures.whenRepositoryThrowsError();
    const promise = fixtures.whenExecuteWith('token-123');

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenRepositoryCalledWith('token-123');
  });
});

class Fixtures {
  public readonly invitationTokenRepository: jest.Mocked<IInvitationTokenRepository>;
  public readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase;

  public readonly token = 'token-123';
  public readonly preview: InvitationTokenPreview;
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

    this.getInvitationPreviewUseCase = new GetInvitationPreviewUseCase(this.invitationTokenRepository);

    this.preview = {
      isValid: true,
      firstname: 'Jean',
      lastname: 'Dupont',
      invitedEmail: 'jean.dupont@mail.com',
      maskedEmail: 'j***@mail.com',
      establishmentName: 'Mon Etablissement',
      assignedChatbots: 2,
    };

    this.repositoryError = new Error('DB down');
  }

  whenExecuteWith(token: string) {
    return this.getInvitationPreviewUseCase.execute(token);
  }

  whenRepositoryReturnsPreview() {
    this.invitationTokenRepository.getInvitationPreview.mockResolvedValue(this.preview);
  }

  whenRepositoryThrowsError() {
    this.invitationTokenRepository.getInvitationPreview.mockRejectedValue(this.repositoryError);
  }

  async thenThrowBadRequest(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenRepositoryCalledWith(token: string) {
    expect(this.invitationTokenRepository.getInvitationPreview).toHaveBeenCalledWith(token);
    expect(this.invitationTokenRepository.getInvitationPreview).toHaveBeenCalledTimes(1);
  }

  thenRepositoryNotCalled() {
    expect(this.invitationTokenRepository.getInvitationPreview).not.toHaveBeenCalled();
  }

  thenReturnExpectedPreview(result: InvitationTokenPreview) {
    expect(result).toEqual(this.preview);
  }
}
