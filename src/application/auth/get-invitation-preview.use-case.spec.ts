import { GetInvitationPreviewUseCase } from './get-invitation-preview.use-case';
import { AuthRepository } from '../../interfaces/persistence/auth.repository';
import { InvitationTokenPreview } from '../../domain/auth/invitation.type';
import { InvitationTokenNotFoundError } from '../../domain/auth/errors/auth.errors';

describe('GetInvitationPreviewUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw InvitationTokenNotFoundError when token is empty', async () => {
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
  public readonly authRepository: jest.Mocked<AuthRepository>;
  public readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase;

  public readonly token = 'token-123';
  public readonly preview: InvitationTokenPreview;
  public readonly repositoryError: Error;

  constructor() {
    this.authRepository = {
      getInvitationPreview: jest.fn(),
      valideInvitationToken: jest.fn(),
      createUser: jest.fn(),
    };

    this.getInvitationPreviewUseCase = new GetInvitationPreviewUseCase(
      this.authRepository,
    );

    this.preview = {
      isValid: true,
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
    this.authRepository.getInvitationPreview.mockResolvedValue(this.preview);
  }

  whenRepositoryThrowsError() {
    this.authRepository.getInvitationPreview.mockRejectedValue(
      this.repositoryError,
    );
  }

  async thenThrowBadRequest(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(InvitationTokenNotFoundError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenRepositoryCalledWith(token: string) {
    expect(this.authRepository.getInvitationPreview).toHaveBeenCalledWith(
      token,
    );
    expect(this.authRepository.getInvitationPreview).toHaveBeenCalledTimes(1);
  }

  thenRepositoryNotCalled() {
    expect(this.authRepository.getInvitationPreview).not.toHaveBeenCalled();
  }

  thenReturnExpectedPreview(result: InvitationTokenPreview) {
    expect(result).toEqual(this.preview);
  }
}
