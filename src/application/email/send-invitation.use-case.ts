import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_PROVIDER, type IEmailProvider } from '../../domain/email/contract/i-email.interface';
import { EmailBody } from '../../domain/email/type/email.type';
import { normalizeLocale } from 'src/domain/shared/locale.type';

@Injectable()
export class SendInvitationUseCase {
  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
  ) {}

  async execute(body: EmailBody): Promise<void> {
    const { invitedEmail, establishmentName, invitationToken, assignedChatbots, locale } = body;

    await this.emailProvider.sendTeacherInvitation(
      invitedEmail,
      establishmentName,
      invitationToken,
      assignedChatbots,
      normalizeLocale(locale),
    );
  }
}
