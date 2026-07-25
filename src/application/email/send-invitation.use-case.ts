import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_PROVIDER, type IEmailProvider } from '../../domain/email/contract/i-email.interface';
import { EmailBody } from '../../domain/email/type/email.type';

@Injectable()
export class SendInvitationUseCase {
  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
  ) {}

  async execute(body: EmailBody): Promise<void> {
    const { invitedEmail, establishmentName, invitationToken, assignedChatbots } = body;
    await this.emailProvider.sendProfesseurInvitation(
      invitedEmail,
      establishmentName,
      invitationToken,
      assignedChatbots,
    );
  }
}
