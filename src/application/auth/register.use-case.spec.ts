import { RegisterUseCase } from './register.use-case';
import { AuthRepository } from '../../interfaces/persistence/auth.repository';
import { EmailProviderInterface } from '../../domain/email/contract/email.interface';
import { RegisterBody } from '../../domain/auth/auth.type';

describe('RegisterUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create user then send welcome email for non-student role', async () => {
    fixtures.whenCreateUserResolves();
    fixtures.whenSendWelcomeEmailResolves();

    await fixtures.whenExecuteWith(fixtures.teacherBody);

    fixtures.thenCreateUserCalledWithTeacherMetadata();
    fixtures.thenSendWelcomeEmailCalledWith(
      fixtures.teacherBody.email,
      fixtures.teacherBody.firstname,
      fixtures.teacherBody.role,
    );
  });

  it('should add establishment in metadata for student role', async () => {
    fixtures.whenCreateUserResolves();
    fixtures.whenSendWelcomeEmailResolves();

    await fixtures.whenExecuteWith(fixtures.studentBody);

    fixtures.thenCreateUserCalledWithStudentMetadata();
    fixtures.thenSendWelcomeEmailCalledWith(
      fixtures.studentBody.email,
      fixtures.studentBody.firstname,
      fixtures.studentBody.role,
    );
  });

  it('should propagate repository error and not send email', async () => {
    fixtures.whenCreateUserThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.teacherBody);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenSendWelcomeEmailNotCalled();
  });

  it('should propagate email provider error', async () => {
    fixtures.whenCreateUserResolves();
    fixtures.whenSendWelcomeEmailThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.teacherBody);

    await fixtures.thenThrowEmailProviderError(promise);
    fixtures.thenCreateUserCalledWithTeacherMetadata();
  });
});

class Fixtures {
  public readonly authRepository: jest.Mocked<AuthRepository>;
  public readonly emailProvider: jest.Mocked<EmailProviderInterface>;
  public readonly registerUseCase: RegisterUseCase;

  public readonly repositoryError: Error;
  public readonly emailProviderError: Error;

  public readonly teacherBody: RegisterBody;
  public readonly studentBody: RegisterBody;

  constructor() {
    this.authRepository = {
      getInvitationPreview: jest.fn(),
      valideInvitationToken: jest.fn(),
      createUser: jest.fn(),
    };

    this.emailProvider = {
      sendWelcomeEmail: jest.fn(),
    };

    this.registerUseCase = new RegisterUseCase(
      this.authRepository,
      this.emailProvider,
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

  whenCreateUserResolves() {
    this.authRepository.createUser.mockResolvedValue(undefined);
  }

  whenCreateUserThrowsError() {
    this.authRepository.createUser.mockRejectedValue(this.repositoryError);
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

  thenCreateUserCalledWithTeacherMetadata() {
    expect(this.authRepository.createUser).toHaveBeenCalledWith(
      this.teacherBody.email,
      this.teacherBody.password,
      {
        role: 'teacher',
        firstname: this.teacherBody.firstname,
        lastname: this.teacherBody.lastname,
        acceptTerms: this.teacherBody.acceptTerms,
      },
    );
    expect(this.authRepository.createUser).toHaveBeenCalledTimes(1);
  }

  thenCreateUserCalledWithStudentMetadata() {
    expect(this.authRepository.createUser).toHaveBeenCalledWith(
      this.studentBody.email,
      this.studentBody.password,
      {
        role: 'student',
        firstname: this.studentBody.firstname,
        lastname: this.studentBody.lastname,
        acceptTerms: this.studentBody.acceptTerms,
        establishment: this.studentBody.establishment,
      },
    );
    expect(this.authRepository.createUser).toHaveBeenCalledTimes(1);
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
