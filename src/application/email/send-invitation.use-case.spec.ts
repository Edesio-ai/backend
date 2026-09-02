import { SendInvitationUseCase } from './send-invitation.use-case';
import { IEmailProvider } from '../../domain/email/contract/i-email.interface';
import { EmailBody } from '../../domain/email/type/email.type';
import { createMockEmailProvider } from 'src/testing/mock-email-provider';

describe('SendInvitationUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should send teacher invitation email when body is valid', async () => {
    fixtures.whenSendTeacherInvitationResolves();

    await fixtures.whenExecuteWith(fixtures.body);

    fixtures.thenSendTeacherInvitationCalledWith(
      fixtures.body.invitedEmail,
      fixtures.body.establishmentName,
      fixtures.body.invitationToken,
      fixtures.body.assignedChatbots,
      'fr',
    );
  });

  it('should forward English locale to the email provider', async () => {
    fixtures.whenSendTeacherInvitationResolves();

    await fixtures.whenExecuteWith({ ...fixtures.body, locale: 'en' });

    fixtures.thenSendTeacherInvitationCalledWith(
      fixtures.body.invitedEmail,
      fixtures.body.establishmentName,
      fixtures.body.invitationToken,
      fixtures.body.assignedChatbots,
      'en',
    );
  });

  it('should propagate email provider error', async () => {
    fixtures.whenSendTeacherInvitationThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowEmailProviderError(promise);
    fixtures.thenSendTeacherInvitationCalledWith(
      fixtures.body.invitedEmail,
      fixtures.body.establishmentName,
      fixtures.body.invitationToken,
      fixtures.body.assignedChatbots,
      'fr',
    );
  });
});

class Fixtures {
  public readonly emailProvider: jest.Mocked<IEmailProvider>;
  public readonly sendInvitationUseCase: SendInvitationUseCase;

  public readonly body: EmailBody;
  public readonly emailProviderError: Error;

  constructor() {
    this.emailProvider = createMockEmailProvider();

    this.sendInvitationUseCase = new SendInvitationUseCase(this.emailProvider);

    this.body = {
      invitedEmail: 'prof@school.com',
      establishmentName: 'Edesio Academy',
      invitationToken: 'inv-token-123',
      assignedChatbots: 3,
    };

    this.emailProviderError = new Error('Email provider down');
  }

  whenExecuteWith(body: EmailBody) {
    return this.sendInvitationUseCase.execute(body);
  }

  whenSendTeacherInvitationResolves() {
    this.emailProvider.sendTeacherInvitation.mockResolvedValue(undefined);
  }

  whenSendTeacherInvitationThrowsError() {
    this.emailProvider.sendTeacherInvitation.mockRejectedValue(this.emailProviderError);
  }

  async thenThrowEmailProviderError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.emailProviderError);
  }

  thenSendTeacherInvitationCalledWith(
    email: string,
    name: string,
    invitationToken: string,
    availableChatbots: number,
    locale: 'en' | 'fr',
  ) {
    expect(this.emailProvider.sendTeacherInvitation).toHaveBeenCalledWith(
      email,
      name,
      invitationToken,
      availableChatbots,
      locale,
    );
    expect(this.emailProvider.sendTeacherInvitation).toHaveBeenCalledTimes(1);
  }
}
