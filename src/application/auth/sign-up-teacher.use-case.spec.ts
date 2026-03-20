import { SignUpTeacherUseCase } from './sign-up-teacher.use-case';
import { AuthRepository } from '../../interfaces/persistence/auth.repository';
import { InvitationToken } from '../../domain/auth/invitation.type';
import { SignUpTeacherBody } from '../../domain/auth/sign-up.type';

describe('SignUpTeacherUseCase', () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it('should validate invitation token then create teacher when body is valid', async () => {
        fixtures.whenValideInvitationTokenReturnsInvitation();
        fixtures.whenCreateTeacherResolves();

        await fixtures.whenExecuteWith(fixtures.body);

        fixtures.thenValideInvitationTokenCalledWith(fixtures.body.token, fixtures.body.email);
        fixtures.thenCreateTeacherCalledWith(
            fixtures.body.email,
            fixtures.body.password,
            fixtures.body.firstname,
            fixtures.body.lastname,
            fixtures.invitationToken,
        );
    });

    it('should propagate error when valideInvitationToken fails', async () => {
        fixtures.whenValideInvitationTokenThrowsError();

        const promise = fixtures.whenExecuteWith(fixtures.body);

        await fixtures.thenThrowRepositoryError(promise);
        fixtures.thenCreateTeacherNotCalled();
    });

    it('should propagate error when createTeacher fails', async () => {
        fixtures.whenValideInvitationTokenReturnsInvitation();
        fixtures.whenCreateTeacherThrowsError();

        const promise = fixtures.whenExecuteWith(fixtures.body);

        await fixtures.thenThrowRepositoryError(promise);
        fixtures.thenValideInvitationTokenCalledWith(fixtures.body.token, fixtures.body.email);
    });
});

class Fixtures {
    public readonly authRepository: jest.Mocked<AuthRepository>;
    public readonly signUpTeacherUseCase: SignUpTeacherUseCase;

    public readonly body: SignUpTeacherBody;
    public readonly invitationToken: InvitationToken;
    public readonly repositoryError: Error;

    constructor() {
        this.authRepository = {
            getInvitationPreview: jest.fn(),
            valideInvitationToken: jest.fn(),
            createTeacher: jest.fn(),
        };

        this.signUpTeacherUseCase = new SignUpTeacherUseCase(this.authRepository);

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

    whenCreateTeacherResolves() {
        this.authRepository.createTeacher.mockResolvedValue(undefined);
    }

    whenCreateTeacherThrowsError() {
        this.authRepository.createTeacher.mockRejectedValue(this.repositoryError);
    }

    async thenThrowRepositoryError(promise: Promise<unknown>) {
        await expect(promise).rejects.toBe(this.repositoryError);
    }

    thenValideInvitationTokenCalledWith(token: string, email: string) {
        expect(this.authRepository.valideInvitationToken).toHaveBeenCalledWith(token, email);
        expect(this.authRepository.valideInvitationToken).toHaveBeenCalledTimes(1);
    }

    thenCreateTeacherCalledWith(
        email: string,
        password: string,
        firstname: string,
        lastname: string,
        invitationToken: InvitationToken,
    ) {
        expect(this.authRepository.createTeacher).toHaveBeenCalledWith(
            email,
            password,
            firstname,
            lastname,
            invitationToken,
        );
        expect(this.authRepository.createTeacher).toHaveBeenCalledTimes(1);
    }

    thenCreateTeacherNotCalled() {
        expect(this.authRepository.createTeacher).not.toHaveBeenCalled();
    }
}
