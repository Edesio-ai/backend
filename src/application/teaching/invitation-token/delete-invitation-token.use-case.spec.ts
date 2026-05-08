import { DeleteInvitationTokenUseCase } from './delete-invitation-token.use-case';
import { TokenRepository } from 'src/domain/token/contract/token.repository';

describe('DeleteInvitationTokenUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete invitation token when token is provided', async () => {
    await fixtures.whenExecuteWithToken();

    fixtures.thenRepositoryCalledWithToken();
  });

  it('should propagate repository error', async () => {
    fixtures.whenRepositoryThrowsError();

    const promise = fixtures.whenExecuteWithToken();

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenRepositoryCalledWithToken();
  });
});

class Fixtures {
  public readonly token = 'token-id-1';
  public readonly repositoryError = new Error('delete failed');

  public readonly tokenRepository: jest.Mocked<TokenRepository>;
  public readonly useCase: DeleteInvitationTokenUseCase;

  constructor() {
    this.tokenRepository = {
      deleteInvitationToken: jest.fn().mockResolvedValue(undefined),
      getInvitationByToken: jest.fn(),
      markInvitationTokenAsUsed: jest.fn(),
    };
    this.useCase = new DeleteInvitationTokenUseCase(this.tokenRepository);
  }

  whenExecuteWithToken() {
    return this.useCase.execute(this.token);
  }

  whenRepositoryThrowsError() {
    this.tokenRepository.deleteInvitationToken.mockRejectedValue(
      this.repositoryError,
    );
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenRepositoryCalledWithToken() {
    expect(this.tokenRepository.deleteInvitationToken).toHaveBeenCalledWith(
      this.token,
    );
    expect(this.tokenRepository.deleteInvitationToken).toHaveBeenCalledTimes(1);
  }
}
