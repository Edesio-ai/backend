import { SendInvitationUseCase } from './send-invitation.use-case';
import { IEmailProvider } from '../../domain/email/contract/i-email.interface';
import { EmailBody } from '../../domain/email/type/email.type';

describe('SendInvitationUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should send professeur invitation email when body is valid', async () => {
    fixtures.whenSendProfesseurInvitationResolves();

    await fixtures.whenExecuteWith(fixtures.body);

    fixtures.thenSendProfesseurInvitationCalledWith(
      fixtures.body.invitedEmail,
      fixtures.body.establishmentName,
      fixtures.body.invitationToken,
      fixtures.body.assignedChatbots,
    );
  });

  it('should propagate email provider error', async () => {
    fixtures.whenSendProfesseurInvitationThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowEmailProviderError(promise);
    fixtures.thenSendProfesseurInvitationCalledWith(
      fixtures.body.invitedEmail,
      fixtures.body.establishmentName,
      fixtures.body.invitationToken,
      fixtures.body.assignedChatbots,
    );
  });
});

class Fixtures {
  public readonly emailProvider: jest.Mocked<IEmailProvider>;
  public readonly sendInvitationUseCase: SendInvitationUseCase;

  public readonly body: EmailBody;
  public readonly emailProviderError: Error;

  constructor() {
    this.emailProvider = {
      sendWelcomeEmail: jest.fn(),
      sendProfesseurInvitation: jest.fn(),
      sendCancelSubscriptionEmail: jest.fn(),
    };

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

  whenSendProfesseurInvitationResolves() {
    this.emailProvider.sendProfesseurInvitation.mockResolvedValue(undefined);
  }

  whenSendProfesseurInvitationThrowsError() {
    this.emailProvider.sendProfesseurInvitation.mockRejectedValue(
      this.emailProviderError,
    );
  }

  async thenThrowEmailProviderError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.emailProviderError);
  }

  thenSendProfesseurInvitationCalledWith(
    email: string,
    name: string,
    invitationToken: string,
    availableChatbots: number,
  ) {
    expect(this.emailProvider.sendProfesseurInvitation).toHaveBeenCalledWith(
      email,
      name,
      invitationToken,
      availableChatbots,
    );
    expect(this.emailProvider.sendProfesseurInvitation).toHaveBeenCalledTimes(
      1,
    );
  }
}
