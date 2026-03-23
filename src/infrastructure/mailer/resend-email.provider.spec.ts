import { ResendEmailProvider } from './resend-email.provider';
import { EmailSendingError } from '../../domain/email/errors';

describe('ResendEmailProvider', () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it('should send welcome email with rendered template', async () => {
        fixtures.whenResendSendResolvesWithoutError();

        await fixtures.whenSendWelcomeEmail('teacher');

        fixtures.thenResendCalledWithExpectedPayload();
    });

    it('should throw EmailSendingError when resend returns error', async () => {
        fixtures.whenResendSendResolvesWithError();

        const promise = fixtures.whenSendWelcomeEmail('teacher');

        await fixtures.thenThrowEmailSendingError(promise);
    });

    it('should throw EmailSendingError when resend.emails.send rejects', async () => {
        fixtures.whenResendSendThrows();

        const promise = fixtures.whenSendWelcomeEmail('teacher');

        await fixtures.thenThrowEmailSendingError(promise);
    });
});

class Fixtures {
    public readonly sendMock = jest.fn();
    public readonly provider: ResendEmailProvider;
    public readonly email = 'teacher@school.com';
    public readonly name = 'Jean';
    public readonly resendErrorMessage = 'resend failure';

    constructor() {
        const resendMock = {
            emails: {
                send: this.sendMock,
            },
        };

        this.provider = new ResendEmailProvider(resendMock as any);
    }

    whenSendWelcomeEmail(role: string) {
        return this.provider.sendWelcomeEmail(this.email, this.name, role);
    }

    whenResendSendResolvesWithoutError() {
        this.sendMock.mockResolvedValue({
            data: { id: 'email-id-123' },
            error: null,
        });
    }

    whenResendSendResolvesWithError() {
        this.sendMock.mockResolvedValue({
            data: null,
            error: { message: this.resendErrorMessage },
        });
    }

    whenResendSendThrows() {
        this.sendMock.mockRejectedValue(new Error(this.resendErrorMessage));
    }

    thenResendCalledWithExpectedPayload() {
        expect(this.sendMock).toHaveBeenCalledTimes(1);
        expect(this.sendMock).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'Edesio <noreply@edesio.ai>',
                to: [this.email],
                subject: `Bienvenue sur Edesio, ${this.name} !`,
            }),
        );

        const payload = this.sendMock.mock.calls[0][0];
        expect(payload.html).toContain(`Bienvenue ${this.name} !`);
        expect(payload.html).toContain('Acceder a mon espace');
        expect(payload.html).toContain('/teacher');
    }

    async thenThrowEmailSendingError(promise: Promise<unknown>) {
        await expect(promise).rejects.toBeInstanceOf(EmailSendingError);
        await expect(promise).rejects.toThrow(this.resendErrorMessage);
    }
}
