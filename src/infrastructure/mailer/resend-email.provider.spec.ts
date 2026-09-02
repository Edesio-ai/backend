import { Resend } from 'resend';
import { ResendEmailProvider } from './resend-email.provider';
import { ServerError } from '../../domain/shared/errors/global.errors';
import { Locale } from 'src/domain/shared/locale.type';

describe('ResendEmailProvider', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
    fixtures.whenFrontendUrlIsUnset();
  });

  afterEach(() => {
    fixtures.restoreFrontendUrl();
  });

  it('should send welcome email with rendered template', async () => {
    fixtures.whenResendSendResolvesWithoutError();

    await fixtures.whenSendWelcomeEmail('teacher');

    fixtures.thenResendCalledWithWelcomePayload();
  });

  it('should throw ServerError when resend returns error', async () => {
    fixtures.whenResendSendResolvesWithError();

    const promise = fixtures.whenSendWelcomeEmail('teacher');

    await fixtures.thenThrowEmailSendingError(promise);
  });

  it('should throw ServerError when resend.emails.send rejects', async () => {
    fixtures.whenResendSendThrows();

    const promise = fixtures.whenSendWelcomeEmail('teacher');

    await fixtures.thenThrowEmailSendingError(promise);
  });

  it('should send teacher invitation email with rendered template', async () => {
    fixtures.whenResendSendResolvesWithoutError();

    await fixtures.whenSendTeacherInvitation();

    fixtures.thenResendCalledWithInvitationPayload();
  });

  it('should send teacher invitation email in English when locale is en', async () => {
    fixtures.whenResendSendResolvesWithoutError();

    await fixtures.whenSendTeacherInvitation('en');

    fixtures.thenResendCalledWithEnglishInvitationPayload();
  });

  it('should throw ServerError when invitation send returns error', async () => {
    fixtures.whenResendSendResolvesWithError();

    const promise = fixtures.whenSendTeacherInvitation();

    await fixtures.thenThrowEmailSendingError(promise);
  });

  it('should throw ServerError when invitation send rejects', async () => {
    fixtures.whenResendSendThrows();

    const promise = fixtures.whenSendTeacherInvitation();

    await fixtures.thenThrowEmailSendingError(promise);
  });

  it('should use FRONTEND_URL in invitation email payload when defined', async () => {
    fixtures.whenResendSendResolvesWithoutError();
    fixtures.whenFrontendUrlIs('https://app.edesio.test');

    await fixtures.whenSendTeacherInvitation();

    fixtures.thenInvitationHtmlContainsFrontendUrl('https://app.edesio.test');
  });

  it('should wrap non Error thrown value in ServerError', async () => {
    fixtures.whenResendSendThrowsString();

    const promise = fixtures.whenSendWelcomeEmail('teacher');

    await fixtures.thenThrowEmailSendingErrorWithMessage(promise, 'provider exploded');
  });
});

class Fixtures {
  public readonly sendMock = jest.fn();
  public readonly provider: ResendEmailProvider;
  public readonly email = 'teacher@school.com';
  public readonly name = 'Jean';
  public readonly invitationToken = 'inv-token-123';
  public readonly availableChatbots = 3;
  public readonly resendErrorMessage = 'resend failure';
  private readonly initialFrontendUrl = process.env.FRONTEND_URL;

  constructor() {
    const resendMock = {
      emails: {
        send: this.sendMock,
      },
    };

    this.provider = new ResendEmailProvider(resendMock as unknown as Resend);
  }

  whenSendWelcomeEmail(role: string) {
    return this.provider.sendWelcomeEmail(this.email, this.name, role);
  }

  whenSendTeacherInvitation(locale?: Locale) {
    return this.provider.sendTeacherInvitation(
      this.email,
      this.name,
      this.invitationToken,
      this.availableChatbots,
      locale,
    );
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

  whenResendSendThrowsString() {
    this.sendMock.mockRejectedValue('provider exploded');
  }

  whenFrontendUrlIs(url: string) {
    process.env.FRONTEND_URL = url;
  }

  whenFrontendUrlIsUnset() {
    delete process.env.FRONTEND_URL;
  }

  restoreFrontendUrl() {
    if (this.initialFrontendUrl === undefined) {
      delete process.env.FRONTEND_URL;
      return;
    }
    process.env.FRONTEND_URL = this.initialFrontendUrl;
  }

  thenResendCalledWithWelcomePayload() {
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
    expect(payload.html).toContain('Accéder à mon espace');
    expect(payload.html).toContain('/teacher');
  }

  thenResendCalledWithInvitationPayload() {
    expect(this.sendMock).toHaveBeenCalledTimes(1);
    expect(this.sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Edesio <noreply@edesio.ai>',
        to: [this.email],
        subject: `${this.name} vous invite à rejoindre Edesio`,
      }),
    );

    const payload = this.sendMock.mock.calls[0][0];
    expect(payload.html).toContain('Vous êtes invité(e) !');
    expect(payload.html).toContain(this.invitationToken);
    expect(payload.html).toContain('Créer mon compte professeur');
  }

  thenResendCalledWithEnglishInvitationPayload() {
    expect(this.sendMock).toHaveBeenCalledTimes(1);
    expect(this.sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Edesio <noreply@edesio.ai>',
        to: [this.email],
        subject: `${this.name} invites you to join Edesio`,
      }),
    );

    const payload = this.sendMock.mock.calls[0][0];
    expect(payload.html).toContain("You're invited!");
    expect(payload.html).toContain(this.invitationToken);
    expect(payload.html).toContain('Create my teacher account');
  }

  async thenThrowEmailSendingError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
    await expect(promise).rejects.toThrow(new RegExp(this.resendErrorMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  async thenThrowEmailSendingErrorWithMessage(promise: Promise<unknown>, message: string) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
    await expect(promise).rejects.toThrow(new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  thenInvitationHtmlContainsFrontendUrl(url: string) {
    const payload = this.sendMock.mock.calls[0][0];
    expect(payload.html).toContain(`${url}/register/teacher-invitation/${this.invitationToken}`);
    expect(payload.html).toContain('cid:edesio-logo');
    expect(payload.attachments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ contentId: 'edesio-logo', filename: 'edesio-logo-square.png' }),
      ]),
    );
  }
}
