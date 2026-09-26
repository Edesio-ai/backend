import { InvitationEmailAlreadyRegisteredError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';
import { createMockEmailProvider } from 'src/testing/mock-email-provider';
import { createMockEstablishmentRepository } from 'src/testing/mock-establishment-repository';
import { createMockInvitationTokenRepository } from 'src/testing/mock-invitation-token-repository';
import type { IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import type { IEmailProvider } from 'src/domain/email/contract/i-email.interface';
import type { IEstablishmentRepository } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import type { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { CreateInvitationTokenBody, CreateInvitationTokenUseCase } from './create-invitation-token.use-case';

describe('CreateInvitationTokenUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create invitation token and send email when email is not registered', async () => {
    fixtures.givenEmailIsNotRegistered();
    fixtures.givenEstablishmentExists();
    fixtures.whenCreateInvitationTokenResolves();
    fixtures.whenSendTeacherInvitationResolves();

    await fixtures.whenExecuteWith(fixtures.body);

    fixtures.thenExistsUserByEmailCalled();
    fixtures.thenCreateInvitationTokenCalledWithExpectedArguments();
    fixtures.thenInvitationEmailSent();
  });

  it('should throw InvitationEmailAlreadyRegisteredError when email is already registered', async () => {
    fixtures.givenEmailIsRegistered();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowInvitationEmailAlreadyRegistered(promise);
    fixtures.thenExistsUserByEmailCalled();
    fixtures.thenCreateInvitationTokenNotCalled();
    fixtures.thenInvitationEmailNotSent();
  });

  it('should throw NotFoundError when establishment does not exist', async () => {
    fixtures.givenEmailIsNotRegistered();
    fixtures.givenEstablishmentMissing();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowNotFound(promise);
    fixtures.thenCreateInvitationTokenNotCalled();
    fixtures.thenInvitationEmailNotSent();
  });

  it('should propagate repository error', async () => {
    fixtures.givenEmailIsNotRegistered();
    fixtures.givenEstablishmentExists();
    fixtures.whenCreateInvitationTokenThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenExistsUserByEmailCalled();
    fixtures.thenCreateInvitationTokenCalledWithExpectedArguments();
    fixtures.thenInvitationEmailNotSent();
  });

  it('should propagate existsUserByEmail error', async () => {
    fixtures.whenExistsUserByEmailThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenExistsUserByEmailCalled();
    fixtures.thenCreateInvitationTokenNotCalled();
    fixtures.thenInvitationEmailNotSent();
  });
});

class Fixtures {
  public readonly invitationTokenRepository: jest.Mocked<IInvitationTokenRepository>;
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly establishmentRepository: jest.Mocked<IEstablishmentRepository>;
  public readonly emailProvider: jest.Mocked<IEmailProvider>;
  public readonly createInvitationTokenUseCase: CreateInvitationTokenUseCase;

  public readonly body: CreateInvitationTokenBody;
  public readonly repositoryError: Error;

  constructor() {
    this.invitationTokenRepository = createMockInvitationTokenRepository();
    this.authRepository = createMockAuthRepository();
    this.establishmentRepository = createMockEstablishmentRepository();
    this.emailProvider = createMockEmailProvider();

    this.createInvitationTokenUseCase = new CreateInvitationTokenUseCase(
      this.invitationTokenRepository,
      this.authRepository,
      this.establishmentRepository,
      this.emailProvider,
    );

    this.body = {
      establishmentId: 'est-1',
      token: 'token-123',
      firstname: 'Camille',
      lastname: 'Bernard',
      invitedEmail: 'teacher@school.com',
      expiresAt: new Date('2026-12-31T12:00:00.000Z'),
      assignedChatbots: 3,
      locale: 'fr',
    };
    this.repositoryError = new Error('repository failed');
  }

  givenEmailIsNotRegistered() {
    this.authRepository.existsUserByEmail.mockResolvedValue(false);
  }

  givenEmailIsRegistered() {
    this.authRepository.existsUserByEmail.mockResolvedValue(true);
  }

  givenEstablishmentExists() {
    this.establishmentRepository.getEstablishmentById.mockResolvedValue({
      id: this.body.establishmentId,
      supabaseUserId: 'user-1',
      name: 'Lycée Test',
      email: 'direction@school.com',
      type: 'high_school',
      address: { street: '1 rue Test', zipCode: '69000', city: 'Lyon', country: 'FR' },
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  }

  givenEstablishmentMissing() {
    this.establishmentRepository.getEstablishmentById.mockResolvedValue(null);
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

  whenSendTeacherInvitationResolves() {
    this.emailProvider.sendTeacherInvitation.mockResolvedValue(undefined);
  }

  async thenThrowInvitationEmailAlreadyRegistered(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(InvitationEmailAlreadyRegisteredError);
  }

  async thenThrowNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
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

  thenInvitationEmailSent() {
    expect(this.emailProvider.sendTeacherInvitation).toHaveBeenCalledWith(
      this.body.invitedEmail,
      'Lycée Test',
      this.body.token,
      this.body.assignedChatbots,
      'fr',
    );
    expect(this.emailProvider.sendTeacherInvitation).toHaveBeenCalledTimes(1);
  }

  thenInvitationEmailNotSent() {
    expect(this.emailProvider.sendTeacherInvitation).not.toHaveBeenCalled();
  }
}
