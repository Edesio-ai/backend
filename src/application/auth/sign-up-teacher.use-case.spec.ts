import { SignUpTeacherUseCase } from './sign-up-teacher.use-case';
import { AuthRepository } from '../../interfaces/persistence/auth.repository';
import { InvitationToken } from '../../domain/auth/invitation.type';
import { SignUpTeacherBody } from '../../domain/auth/sign-up.type';
import { EmailProviderInterface } from '../../interfaces/mailer/email.provider';

describe('SignUpTeacherUseCase', () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it('should validate invitation token then create teacher when body is valid', async () => {
        fixtures.whenValideInvitationTokenReturnsInvitation();
        fixtures.whenCreateUserResolves();
        fixtures.whenSendWelcomeEmailResolves();

        await fixtures.whenExecuteWith(fixtures.body);

        fixtures.thenValideInvitationTokenCalledWith(fixtures.body.token, fixtures.body.email);
        fixtures.thenCreateUserCalledWith(
            fixtures.body.email,
            fixtures.body.password,
            fixtures.body.firstname,
            fixtures.body.lastname,
            fixtures.invitationToken,
        );
        fixtures.thenSendWelcomeEmailCalledWith(fixtures.body.email, fixtures.body.firstname, 'teacher');
    });

    it('should propagate error when valideInvitationToken fails', async () => {
        fixtures.whenValideInvitationTokenThrowsError();

        const promise = fixtures.whenExecuteWith(fixtures.body);

        await fixtures.thenThrowRepositoryError(promise);
        fixtures.thenCreateUserNotCalled();
        fixtures.thenSendWelcomeEmailNotCalled();
    });

    it('should propagate error when createUser fails', async () => {
        fixtures.whenValideInvitationTokenReturnsInvitation();
        fixtures.whenCreateUserThrowsError();

        const promise = fixtures.whenExecuteWith(fixtures.body);

        await fixtures.thenThrowRepositoryError(promise);
        fixtures.thenValideInvitationTokenCalledWith(fixtures.body.token, fixtures.body.email);
        fixtures.thenSendWelcomeEmailNotCalled();
    });

    it('should propagate error when sendWelcomeEmail fails', async () => {
        fixtures.whenValideInvitationTokenReturnsInvitation();
        fixtures.whenCreateUserResolves();
        fixtures.whenSendWelcomeEmailThrowsError();

        const promise = fixtures.whenExecuteWith(fixtures.body);

        await fixtures.thenThrowEmailProviderError(promise);
        fixtures.thenValideInvitationTokenCalledWith(fixtures.body.token, fixtures.body.email);
    });
});

class Fixtures {
    public readonly authRepository: jest.Mocked<AuthRepository>;
    public readonly emailProvider: jest.Mocked<EmailProviderInterface>;
    public readonly signUpTeacherUseCase: SignUpTeacherUseCase;

    public readonly body: SignUpTeacherBody;
    public readonly invitationToken: InvitationToken;
    public readonly repositoryError: Error;
    public readonly emailProviderError: Error;

    constructor() {
        this.authRepository = {
            getInvitationPreview: jest.fn(),
            valideInvitationToken: jest.fn(),
            createUser: jest.fn(),
        };

        this.emailProvider = {
            sendWelcomeEmail: jest.fn(),
        };

        this.signUpTeacherUseCase = new SignUpTeacherUseCase(this.authRepository, this.emailProvider);

        this.body = {
            token: 'invitation-token-abc',
            email: 'teacher@school.com',
            password: 'secret123',
            firstname: 'Jean',
            lastname: 'Dupont',
        };

        this.invitationToken = {
            id: 'inv-1',
            establishment_id: 'est-1',
            token: this.body.token,
            invited_email: this.body.email,
            expires_at: '2026-12-31T23:59:59.000Z',
            used_at: null,
            used_by: null,
            created_at: '2026-01-01T00:00:00.000Z',
            assigned_chatbots: 3,
        };

        this.repositoryError = new Error('DB down');
        this.emailProviderError = new Error('Email provider down');
    }

    whenExecuteWith(body: SignUpTeacherBody) {
        return this.signUpTeacherUseCase.execute(body);
    }

    whenValideInvitationTokenReturnsInvitation() {
        this.authRepository.valideInvitationToken.mockResolvedValue(this.invitationToken);
    }

    whenValideInvitationTokenThrowsError() {
        this.authRepository.valideInvitationToken.mockRejectedValue(this.repositoryError);
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
        this.emailProvider.sendWelcomeEmail.mockRejectedValue(this.emailProviderError);
    }

    async thenThrowRepositoryError(promise: Promise<unknown>) {
        await expect(promise).rejects.toBe(this.repositoryError);
    }

    async thenThrowEmailProviderError(promise: Promise<unknown>) {
        await expect(promise).rejects.toBe(this.emailProviderError);
    }

    thenValideInvitationTokenCalledWith(token: string, email: string) {
        expect(this.authRepository.valideInvitationToken).toHaveBeenCalledWith(token, email);
        expect(this.authRepository.valideInvitationToken).toHaveBeenCalledTimes(1);
    }

    thenCreateUserCalledWith(
        email: string,
        password: string,
        firstname: string,
        lastname: string,
        invitationToken: InvitationToken,
    ) {
        expect(this.authRepository.createUser).toHaveBeenCalledWith(
            email,
            password,
            {
                role: 'teacher',
                firstname,
                lastname,
            },
            invitationToken,
        );
        expect(this.authRepository.createUser).toHaveBeenCalledTimes(1);
    }

    thenCreateUserNotCalled() {
        expect(this.authRepository.createUser).not.toHaveBeenCalled();
    }

    thenSendWelcomeEmailCalledWith(email: string, name: string, role: string) {
        expect(this.emailProvider.sendWelcomeEmail).toHaveBeenCalledWith(email, name, role);
        expect(this.emailProvider.sendWelcomeEmail).toHaveBeenCalledTimes(1);
    }

    thenSendWelcomeEmailNotCalled() {
        expect(this.emailProvider.sendWelcomeEmail).not.toHaveBeenCalled();
    }
}
