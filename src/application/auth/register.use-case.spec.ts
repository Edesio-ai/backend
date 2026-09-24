import { RegisterUseCase } from './register.use-case';
import type { IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { IEmailProvider } from '../../domain/email/contract/i-email.interface';
import { RegisterBody, RegisterEstablishmentBody } from '../../domain/auth/types/auth.type';
import type { InvitationToken } from 'src/domain/auth/invitation.type';
import type { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import type { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import type { IEstablishmentRepository } from '../../domain/teaching/establishment/contracts/i-establishment.repository';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';
import { createMockEmailProvider } from 'src/testing/mock-email-provider';
import { createMockInvitationTokenRepository } from 'src/testing/mock-invitation-token-repository';
import { createMockEstablishmentRepository } from 'src/testing/mock-establishment-repository';

describe('RegisterUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('establishment role', () => {
    it('creates auth user, establishment, sends welcome email and returns establishment with contact', async () => {
      fixtures.whenCreateAuthUserResolvesEstablishmentContact();
      fixtures.whenCreateEstablishmentResolves();
      fixtures.whenSendWelcomeEmailResolves();

      const result = await fixtures.whenExecuteWith(fixtures.establishmentBody);

      fixtures.thenCreateAuthUserCalledWithEstablishmentContact();
      fixtures.thenCreateEstablishmentCalled();
      fixtures.thenSendWelcomeEmailCalledWith(
        fixtures.establishmentAuthUser.email,
        fixtures.establishmentBody.contact.firstname,
        fixtures.establishmentBody.role,
      );
      fixtures.thenReturnsEstablishmentWithContact(result);
    });

    it('throws BadRequestError when auth user is not created', async () => {
      fixtures.whenCreateAuthUserReturnsNull();

      await expect(fixtures.whenExecuteWith(fixtures.establishmentBody)).rejects.toBeInstanceOf(BadRequestError);
      expect(fixtures.establishmentRepository.createEstablishment).not.toHaveBeenCalled();
      fixtures.thenSendWelcomeEmailNotCalled();
    });

    it('propagates establishment repository error and does not send email', async () => {
      fixtures.whenCreateAuthUserResolvesEstablishmentContact();
      fixtures.whenCreateEstablishmentThrowsError();

      const promise = fixtures.whenExecuteWith(fixtures.establishmentBody);

      await fixtures.thenThrowRepositoryError(promise);
      fixtures.thenSendWelcomeEmailNotCalled();
    });
  });

  describe('without invitation token', () => {
    it('creates auth user then sends welcome email', async () => {
      fixtures.whenCreateAuthUserResolves();
      fixtures.whenSendWelcomeEmailResolves();

      await fixtures.whenExecuteWith(fixtures.teacherBodyWithoutToken);

      fixtures.thenCreateAuthUserCalledWithTeacherMetadataWithoutToken();
      fixtures.thenInvitationFlowNotUsed();
      fixtures.thenSendWelcomeEmailCalledWith(
        fixtures.teacherBodyWithoutToken.email,
        fixtures.teacherBodyWithoutToken.firstname,
        fixtures.teacherBodyWithoutToken.role,
      );
    });

    it('adds establishment in metadata for student role', async () => {
      fixtures.whenCreateAuthUserResolves();
      fixtures.whenSendWelcomeEmailResolves();

      await fixtures.whenExecuteWith(fixtures.studentBodyWithoutToken);

      fixtures.thenCreateAuthUserCalledWithStudentMetadataWithoutToken();
      fixtures.thenInvitationFlowNotUsed();
      fixtures.thenSendWelcomeEmailCalledWith(
        fixtures.studentBodyWithoutToken.email,
        fixtures.studentBodyWithoutToken.firstname,
        fixtures.studentBodyWithoutToken.role,
      );
    });

    it('propagates repository error and does not send email', async () => {
      fixtures.whenCreateAuthUserThrowsError();

      const promise = fixtures.whenExecuteWith(fixtures.teacherBodyWithoutToken);

      await fixtures.thenThrowRepositoryError(promise);
      fixtures.thenSendWelcomeEmailNotCalled();
    });

    it('propagates email provider error', async () => {
      fixtures.whenCreateAuthUserResolves();
      fixtures.whenSendWelcomeEmailThrowsError();

      const promise = fixtures.whenExecuteWith(fixtures.teacherBodyWithoutToken);

      await fixtures.thenThrowEmailProviderError(promise);
      fixtures.thenCreateAuthUserCalledWithTeacherMetadataWithoutToken();
    });
  });

  describe('with invitation token', () => {
    it('throws BadRequestError when invitation token is not found', async () => {
      fixtures.whenInvitationTokenMissing();

      await expect(fixtures.whenExecuteWith(fixtures.teacherBody)).rejects.toBeInstanceOf(BadRequestError);
      expect(fixtures.authRepository.createAuthUser).not.toHaveBeenCalled();
    });

    it('throws BadRequestError when invited email does not match', async () => {
      fixtures.whenInvitationTokenResolves({
        ...fixtures.invitationToken,
        invitedEmail: 'other@school.com',
      });

      await expect(fixtures.whenExecuteWith(fixtures.teacherBody)).rejects.toBeInstanceOf(BadRequestError);
      expect(fixtures.authRepository.createAuthUser).not.toHaveBeenCalled();
    });

    it('creates auth user, teacher from invitation, marks token used, then sends welcome email', async () => {
      fixtures.whenInvitationTokenResolves();
      fixtures.whenCreateAuthUserResolves();
      fixtures.whenCreateTeacherWithInvitationResolves();
      fixtures.whenUpdateTokenUsedAtResolves();
      fixtures.whenSendWelcomeEmailResolves();

      await fixtures.whenExecuteWith(fixtures.teacherBody);

      fixtures.thenCreateAuthUserCalledWithTeacherMetadata();
      fixtures.thenCreateTeacherWithInvitationCalled();
      fixtures.thenUpdateTokenUsedAtCalled();
      fixtures.thenSendWelcomeEmailCalledWith(
        fixtures.teacherBody.email,
        fixtures.teacherBody.firstname,
        fixtures.teacherBody.role,
      );
    });

    it('propagates repository error and does not send email', async () => {
      fixtures.whenInvitationTokenResolves();
      fixtures.whenCreateAuthUserThrowsError();

      const promise = fixtures.whenExecuteWith(fixtures.teacherBody);

      await fixtures.thenThrowRepositoryError(promise);
      fixtures.thenSendWelcomeEmailNotCalled();
    });
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly emailProvider: jest.Mocked<IEmailProvider>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly invitationTokenRepository: jest.Mocked<IInvitationTokenRepository>;
  public readonly establishmentRepository: jest.Mocked<IEstablishmentRepository>;
  public readonly registerUseCase: RegisterUseCase;

  public readonly repositoryError: Error;
  public readonly emailProviderError: Error;

  public readonly invitationToken: InvitationToken;
  public readonly teacherBody: RegisterBody;
  public readonly teacherBodyWithoutToken: RegisterBody;
  public readonly studentBodyWithoutToken: RegisterBody;
  public readonly establishmentBody: RegisterEstablishmentBody;
  public readonly authUser = {
    id: 'auth-u1',
    email: 'teacher@school.com',
    metadata: {
      role: 'teacher' as const,
      firstname: 'Jean',
      lastname: 'Dupont',
      acceptTerms: true,
    },
  };
  public readonly establishmentAuthUser = {
    id: 'auth-est-1',
    email: 'owner@school.com',
    metadata: {
      role: 'establishment' as const,
      firstname: 'Alex',
      lastname: 'Martin',
      acceptTerms: true,
    },
  };
  public readonly createdEstablishment = {
    id: 'est-1',
    supabaseUserId: 'auth-est-1',
    name: 'Lycée Victor Hugo',
    email: 'owner@school.com',
    type: 'high_school' as const,
    address: {
      street: '12 rue de la République',
      zipCode: '75001',
      city: 'Paris',
      country: 'FR' as const,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  public readonly createdTeacher = {
    id: 'teacher-1',
    name: 'Jean Dupont',
    email: 'teacher@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: 'est-1',
    availableChatbots: 3,
    supabaseUserId: 'auth-u1',
  };

  constructor() {
    this.authRepository = createMockAuthRepository();
    this.emailProvider = createMockEmailProvider();
    this.teacherRepository = createMockTeacherRepository();
    this.invitationTokenRepository = createMockInvitationTokenRepository();
    this.establishmentRepository = createMockEstablishmentRepository();

    this.registerUseCase = new RegisterUseCase(
      this.authRepository,
      this.emailProvider,
      this.teacherRepository,
      this.invitationTokenRepository,
      this.establishmentRepository,
    );

    this.repositoryError = new Error('DB down');
    this.emailProviderError = new Error('Email provider down');

    this.invitationToken = {
      id: 'inv-1',
      establishmentId: 'est-1',
      token: 'tok-abc',
      invitedEmail: 'teacher@school.com',
      expiresAt: '2026-12-31T00:00:00.000Z',
      usedAt: null,
      usedBy: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      assignedChatbots: 3,
    };

    this.teacherBody = {
      role: 'teacher',
      email: 'teacher@school.com',
      password: 'secret123',
      firstname: 'Jean',
      lastname: 'Dupont',
      acceptTerms: true,
      invitationToken: this.invitationToken.token,
    };

    this.teacherBodyWithoutToken = {
      role: 'teacher',
      email: 'teacher@school.com',
      password: 'secret123',
      firstname: 'Jean',
      lastname: 'Dupont',
      acceptTerms: true,
    };

    this.studentBodyWithoutToken = {
      role: 'student',
      email: 'student@school.com',
      password: 'secret123',
      firstname: 'Marie',
      lastname: 'Durand',
      acceptTerms: true,
      establishment: 'Edesio Academy',
    };

    this.establishmentBody = {
      role: 'establishment',
      type: 'high_school',
      name: 'Lycée Victor Hugo',
      address: {
        street: '12 rue de la République',
        zipCode: '75001',
        city: 'Paris',
        country: 'FR',
      },
      contact: {
        firstname: 'Alex',
        lastname: 'Martin',
        email: 'owner@school.com',
        password: 'SecurePass12!Extra',
        acceptTerms: true,
      },
    };
  }

  whenExecuteWith(body: RegisterBody | RegisterEstablishmentBody) {
    return this.registerUseCase.execute(body);
  }

  whenInvitationTokenResolves(token: InvitationToken = this.invitationToken) {
    this.invitationTokenRepository.getInvitationByToken.mockResolvedValue(token);
  }

  whenInvitationTokenMissing() {
    this.invitationTokenRepository.getInvitationByToken.mockResolvedValue(null as unknown as InvitationToken);
  }

  whenCreateAuthUserResolves() {
    this.authRepository.createAuthUser.mockResolvedValue(this.authUser);
  }

  whenCreateAuthUserResolvesEstablishmentContact() {
    this.authRepository.createAuthUser.mockResolvedValue(this.establishmentAuthUser);
  }

  whenCreateAuthUserReturnsNull() {
    this.authRepository.createAuthUser.mockResolvedValue(null as never);
  }

  whenCreateAuthUserThrowsError() {
    this.authRepository.createAuthUser.mockRejectedValue(this.repositoryError);
  }

  whenCreateEstablishmentResolves() {
    this.establishmentRepository.createEstablishment.mockResolvedValue(this.createdEstablishment);
  }

  whenCreateEstablishmentThrowsError() {
    this.establishmentRepository.createEstablishment.mockRejectedValue(this.repositoryError);
  }

  whenCreateTeacherWithInvitationResolves() {
    this.teacherRepository.createTeacherWithInvitationToken.mockResolvedValue(this.createdTeacher);
  }

  whenUpdateTokenUsedAtResolves() {
    this.invitationTokenRepository.updateTokenUsedAt.mockResolvedValue(undefined);
  }

  whenSendWelcomeEmailResolves() {
    this.emailProvider.sendWelcomeEmail.mockResolvedValue(undefined);
  }

  whenSendWelcomeEmailThrowsError() {
    this.emailProvider.sendWelcomeEmail.mockRejectedValue(this.emailProviderError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  async thenThrowEmailProviderError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.emailProviderError);
  }

  thenCreateAuthUserCalledWithTeacherMetadataWithoutToken() {
    expect(this.authRepository.createAuthUser).toHaveBeenCalledWith(
      this.teacherBodyWithoutToken.email,
      this.teacherBodyWithoutToken.password,
      {
        role: 'teacher',
        firstname: this.teacherBodyWithoutToken.firstname,
        lastname: this.teacherBodyWithoutToken.lastname,
        acceptTerms: this.teacherBodyWithoutToken.acceptTerms,
        invitationToken: undefined,
      },
    );
    expect(this.authRepository.createAuthUser).toHaveBeenCalledTimes(1);
  }

  thenCreateAuthUserCalledWithStudentMetadataWithoutToken() {
    expect(this.authRepository.createAuthUser).toHaveBeenCalledWith(
      this.studentBodyWithoutToken.email,
      this.studentBodyWithoutToken.password,
      {
        role: 'student',
        firstname: this.studentBodyWithoutToken.firstname,
        lastname: this.studentBodyWithoutToken.lastname,
        acceptTerms: this.studentBodyWithoutToken.acceptTerms,
        invitationToken: undefined,
        establishment: this.studentBodyWithoutToken.establishment,
      },
    );
    expect(this.authRepository.createAuthUser).toHaveBeenCalledTimes(1);
  }

  thenCreateAuthUserCalledWithTeacherMetadata() {
    expect(this.authRepository.createAuthUser).toHaveBeenCalledWith(this.teacherBody.email, this.teacherBody.password, {
      role: 'teacher',
      firstname: this.teacherBody.firstname,
      lastname: this.teacherBody.lastname,
      acceptTerms: this.teacherBody.acceptTerms,
      invitationToken: this.teacherBody.invitationToken,
    });
    expect(this.authRepository.createAuthUser).toHaveBeenCalledTimes(1);
  }

  thenCreateTeacherWithInvitationCalled() {
    expect(this.teacherRepository.createTeacherWithInvitationToken).toHaveBeenCalledWith(
      this.authUser,
      this.invitationToken,
    );
  }

  thenUpdateTokenUsedAtCalled() {
    expect(this.invitationTokenRepository.updateTokenUsedAt).toHaveBeenCalledWith(
      this.invitationToken.id,
      this.createdTeacher.id,
    );
  }

  thenInvitationFlowNotUsed() {
    expect(this.invitationTokenRepository.getInvitationByToken).not.toHaveBeenCalled();
    expect(this.teacherRepository.createTeacherWithInvitationToken).not.toHaveBeenCalled();
    expect(this.invitationTokenRepository.updateTokenUsedAt).not.toHaveBeenCalled();
  }

  thenSendWelcomeEmailCalledWith(email: string, name: string, role: string) {
    expect(this.emailProvider.sendWelcomeEmail).toHaveBeenCalledWith(email, name, role, 'fr');
    expect(this.emailProvider.sendWelcomeEmail).toHaveBeenCalledTimes(1);
  }

  thenSendWelcomeEmailNotCalled() {
    expect(this.emailProvider.sendWelcomeEmail).not.toHaveBeenCalled();
  }

  thenCreateAuthUserCalledWithEstablishmentContact() {
    expect(this.authRepository.createAuthUser).toHaveBeenCalledWith(
      this.establishmentBody.contact.email,
      this.establishmentBody.contact.password,
      {
        role: 'establishment',
        firstname: this.establishmentBody.contact.firstname,
        lastname: this.establishmentBody.contact.lastname,
        acceptTerms: this.establishmentBody.contact.acceptTerms,
      },
    );
    expect(this.authRepository.createAuthUser).toHaveBeenCalledTimes(1);
  }

  thenCreateEstablishmentCalled() {
    expect(this.establishmentRepository.createEstablishment).toHaveBeenCalledWith({
      supabaseUserId: this.establishmentAuthUser.id,
      name: this.establishmentBody.name,
      email: this.establishmentAuthUser.email,
      type: this.establishmentBody.type,
      address: this.establishmentBody.address,
    });
    expect(this.establishmentRepository.createEstablishment).toHaveBeenCalledTimes(1);
  }

  thenReturnsEstablishmentWithContact(result: unknown) {
    expect(result).toEqual({
      ...this.createdEstablishment,
      contact: {
        email: this.establishmentAuthUser.email,
        firstname: this.establishmentBody.contact.firstname,
        lastname: this.establishmentBody.contact.lastname,
      },
    });
  }
}
