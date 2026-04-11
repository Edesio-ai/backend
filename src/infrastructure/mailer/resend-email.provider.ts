import { Inject, Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { EmailProviderInterface } from '../../domain/email/contract/email.interface';
import { RESEND_CLIENT } from './resend.module';
import { buildWelcomeEmailTemplateData } from './templates/welcome/welcome-email.data';
import { renderWelcomeEmailHtml } from './templates/welcome/welcome-email.renderer';
import { EmailSendingError } from '../../domain/email/error/email.errors';
import { buildProfesseurInvitationTemplateData } from './templates/invitation/professeur-invitation-email.data';
import { renderProfesseurInvitationEmailHtml } from './templates/invitation/professeur-invitation-email.renderer';

@Injectable()
export class ResendEmailProvider implements EmailProviderInterface {
  constructor(@Inject(RESEND_CLIENT) private readonly resend: Resend) {}

  public async sendProfesseurInvitation(
    email: string,
    name: string,
    invitationToken: string,
    availableChatbots: number,
  ): Promise<void> {
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

    const templateData = buildProfesseurInvitationTemplateData({
      inviterName: name,
      invitationToken,
      availableChatbots,
      appUrl: appUrl,
      logoUrl: `${appUrl}/icon-192.png`,
    });
    const html = renderProfesseurInvitationEmailHtml(templateData);

    try {
      const { error } = await this.resend.emails.send({
        from: 'Edesio <noreply@edesio.ai>',
        to: [email],
        subject: `${name} vous invite a rejoindre Edesio`,
        html,
      });

      if (error) {
        throw new EmailSendingError(error.message);
      }
    } catch (err) {
      if (err instanceof EmailSendingError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new EmailSendingError(message);
    }
  }

  public async sendWelcomeEmail(
    email: string,
    name: string,
    role: string,
  ): Promise<void> {
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

    const templateData = buildWelcomeEmailTemplateData({
      role,
      name,
      appUrl: appUrl,
      logoUrl: `${appUrl}/icon-192.png`,
    });
    const html = renderWelcomeEmailHtml(templateData);

    try {
      const { error } = await this.resend.emails.send({
        from: 'Edesio <noreply@edesio.ai>',
        to: [email],
        subject: `Bienvenue sur Edesio, ${name} !`,
        html,
      });

      if (error) {
        throw new EmailSendingError(error.message);
      }
    } catch (err) {
      if (err instanceof EmailSendingError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new EmailSendingError(message);
    }
  }
}
