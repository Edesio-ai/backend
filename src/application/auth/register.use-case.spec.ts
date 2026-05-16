import { RegisterUseCase } from './register.use-case';
import type { IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { IEmailProvider } from '../../domain/email/contract/i-email.interface';
import { RegisterBody } from '../../domain/auth/types/auth.type';
import type { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import type { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';
import { createMockEmailProvider } from 'src/testing/mock-email-provider';
import { createMockInvitationTokenRepository } from 'src/testing/mock-invitation-token-repository';

describe('RegisterUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create user then send welcome email for non-student role', async () => {
    fixtures.whenCreateAuthUserResolves();
    fixtures.whenSendWelcomeEmailResolves();

    await fixtures.whenExecuteWith(fixtures.teacherBody);

    fixtures.thenCreateAuthUserCalledWithTeacherMetadata();
    fixtures.thenSendWelcomeEmailCalledWith(
      fixtures.teacherBody.email,
      fixtures.teacherBody.firstname,
      fixtures.teacherBody.role,
    );
  });

  it('should add establishment in metadata for student role', async () => {
    fixtures.whenCreateAuthUserResolves();
    fixtures.whenSendWelcomeEmailResolves();

    await fixtures.whenExecuteWith(fixtures.studentBody);

    fixtures.thenCreateAuthUserCalledWithStudentMetadata();
    fixtures.thenSendWelcomeEmailCalledWith(
      fixtures.studentBody.email,
      fixtures.studentBody.firstname,
      fixtures.studentBody.role,
    );
  });

  it('should propagate repository error and not send email', async () => {
    fixtures.whenCreateAuthUserThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.teacherBody);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenSendWelcomeEmailNotCalled();
  });

  it('should propagate email provider error', async () => {
    fixtures.whenCreateAuthUserResolves();
    fixtures.whenSendWelcomeEmailThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.teacherBody);

    await fixtures.thenThrowEmailProviderError(promise);
    fixtures.thenCreateAuthUserCalledWithTeacherMetadata();
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly emailProvider: jest.Mocked<IEmailProvider>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly invitationTokenRepository: jest.Mocked<IInvitationTokenRepository>;
  public readonly registerUseCase: RegisterUseCase;

  public readonly repositoryError: Error;
  public readonly emailProviderError: Error;

  public readonly teacherBody: RegisterBody;
  public readonly studentBody: RegisterBody;

  constructor() {
    this.authRepository = createMockAuthRepository();

    this.emailProvider = createMockEmailProvider();

    this.teacherRepository = createMockTeacherRepository();

    this.invitationTokenRepository = createMockInvitationTokenRepository();

    this.registerUseCase = new RegisterUseCase(
      this.authRepository,
      this.emailProvider,
      this.teacherRepository,
      this.invitationTokenRepository,
    );

    this.repositoryError = new Error('DB down');
    this.emailProviderError = new Error('Email provider down');

    this.teacherBody = {
      role: 'teacher',
      email: 'teacher@school.com',
      password: 'secret123',
      firstname: 'Jean',
      lastname: 'Dupont',
      acceptTerms: true,
    };

    this.studentBody = {
      role: 'student',
      email: 'student@school.com',
      password: 'secret123',
      firstname: 'Marie',
      lastname: 'Durand',
      acceptTerms: true,
      establishment: 'Edesio Academy',
    };
  }

  whenExecuteWith(body: RegisterBody) {
    return this.registerUseCase.execute(body);
  }

  whenCreateAuthUserResolves() {
    this.authRepository.createAuthUser.mockResolvedValue({
      id: 'auth-u1',
      email: 'ignored-in-test',
      metadata: {},
    });
  }

  whenCreateAuthUserThrowsError() {
    this.authRepository.createAuthUser.mockRejectedValue(this.repositoryError);
  }

  whenSendWelcomeEmailResolves() {
    this.emailProvider.sendWelcomeEmail.mockResolvedValue(undefined);
  }

  whenSendWelcomeEmailThrowsError() {
    this.emailProvider.sendWelcomeEmail.mockRejectedValue(
      this.emailProviderError,
    );
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  async thenThrowEmailProviderError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.emailProviderError);
  }

  thenCreateAuthUserCalledWithTeacherMetadata() {
    expect(this.authRepository.createAuthUser).toHaveBeenCalledWith(
      this.teacherBody.email,
      this.teacherBody.password,
      {
        role: 'teacher',
        firstname: this.teacherBody.firstname,
        lastname: this.teacherBody.lastname,
        acceptTerms: this.teacherBody.acceptTerms,
        invitationToken: undefined,
      },
    );
    expect(this.authRepository.createAuthUser).toHaveBeenCalledTimes(1);
  }

  thenCreateAuthUserCalledWithStudentMetadata() {
    expect(this.authRepository.createAuthUser).toHaveBeenCalledWith(
      this.studentBody.email,
      this.studentBody.password,
      {
        role: 'student',
        firstname: this.studentBody.firstname,
        lastname: this.studentBody.lastname,
        acceptTerms: this.studentBody.acceptTerms,
        invitationToken: undefined,
        establishment: this.studentBody.establishment,
      },
    );
    expect(this.authRepository.createAuthUser).toHaveBeenCalledTimes(1);
  }

  thenSendWelcomeEmailCalledWith(email: string, name: string, role: string) {
    expect(this.emailProvider.sendWelcomeEmail).toHaveBeenCalledWith(
      email,
      name,
      role,
    );
    expect(this.emailProvider.sendWelcomeEmail).toHaveBeenCalledTimes(1);
  }

  thenSendWelcomeEmailNotCalled() {
    expect(this.emailProvider.sendWelcomeEmail).not.toHaveBeenCalled();
  }
}
