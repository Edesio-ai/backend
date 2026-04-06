import { GetInvitationTokenUseCase } from './get-invitation-token.use-case';
import { EstablishmentRepository } from '../../interfaces/persistence/establishment.repository';
import { InvitationToken } from '../../domain/auth/invitation.type';
import { EstablishmentIdNotFoundError } from '../../domain/establishment/error';

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

  it('should throw EstablishmentIdNotFoundError when establishment id is empty', async () => {
    const promise = fixtures.whenExecuteWith('');

    await fixtures.thenThrowEstablishmentIdNotFound(promise);
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
  public readonly establishmentRepository: jest.Mocked<EstablishmentRepository>;
  public readonly getInvitationTokenUseCase: GetInvitationTokenUseCase;

  public readonly establishmentId: string;
  public readonly invitationTokens: InvitationToken[];
  public readonly repositoryError: Error;

  constructor() {
    this.establishmentRepository = {
      getEstablishmentByUserId: jest.fn(),
      createEstablishment: jest.fn(),
      getInvitationTokenByEstablishmentId: jest.fn(),
    };

    this.getInvitationTokenUseCase = new GetInvitationTokenUseCase(
      this.establishmentRepository,
    );

    this.establishmentId = 'est-1';
    this.invitationTokens = [
      {
        id: 'token-id-1',
        establishment_id: this.establishmentId,
        token: 'token-abc',
        invited_email: 'teacher@school.com',
        expires_at: '2026-04-01T00:00:00.000Z',
        used_at: null,
        used_by: null,
        created_at: '2026-03-28T00:00:00.000Z',
        assigned_chatbots: 2,
      },
    ];
    this.repositoryError = new Error('query failed');
  }

  whenExecuteWith(establishmentId: string) {
    return this.getInvitationTokenUseCase.execute(establishmentId);
  }

  whenRepositoryReturnsInvitationTokens() {
    this.establishmentRepository.getInvitationTokenByEstablishmentId.mockResolvedValue(
      this.invitationTokens,
    );
  }

  whenRepositoryThrowsError() {
    this.establishmentRepository.getInvitationTokenByEstablishmentId.mockRejectedValue(
      this.repositoryError,
    );
  }

  async thenThrowEstablishmentIdNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(EstablishmentIdNotFoundError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenRepositoryCalledWithEstablishmentId() {
    expect(
      this.establishmentRepository.getInvitationTokenByEstablishmentId,
    ).toHaveBeenCalledWith(this.establishmentId);
    expect(
      this.establishmentRepository.getInvitationTokenByEstablishmentId,
    ).toHaveBeenCalledTimes(1);
  }

  thenRepositoryNotCalled() {
    expect(
      this.establishmentRepository.getInvitationTokenByEstablishmentId,
    ).not.toHaveBeenCalled();
  }

  thenReturnExpectedInvitationTokens(result: InvitationToken[]) {
    expect(result).toEqual(this.invitationTokens);
  }
}
