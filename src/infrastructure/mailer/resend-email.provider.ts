import { Inject, Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { IEmailProvider } from '../../domain/email/contract/i-email.interface';
import { RESEND_CLIENT } from './resend.module';
import { DEFAULT_LOCALE, type Locale } from 'src/domain/shared/locale.type';
import { buildWelcomeEmailTemplateData } from './templates/welcome/data';
import { renderWelcomeEmail } from './templates/welcome/render';
import { buildTeacherInvitationTemplateData } from './templates/teacher-invitation/data';
import { renderTeacherInvitationEmail } from './templates/teacher-invitation/render';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { CancelSubscriptionEmailParams } from 'src/domain/billing/types/billing.type';
import { renderCancelSubscriptionEmail } from './templates/cancel-subscription/render';
import { getEmailLogoAttachment, getEmailLogoCid } from './templates/html';

@Injectable()
export class ResendEmailProvider implements IEmailProvider {
  constructor(@Inject(RESEND_CLIENT) private readonly resend: Resend) {}

  public async sendTeacherInvitation(
    email: string,
    name: string,
    invitationToken: string,
    availableChatbots: number,
    locale: Locale = DEFAULT_LOCALE,
  ): Promise<void> {
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

    const templateData = buildTeacherInvitationTemplateData({
      inviterName: name,
      invitationToken,
      availableChatbots,
      appUrl,
      logoUrl: getEmailLogoCid(),
      locale,
    });
    const { html, subject } = renderTeacherInvitationEmail(templateData);

    try {
      const { error } = await this.resend.emails.send({
        from: 'Edesio <noreply@edesio.ai>',
        to: [email],
        subject,
        html,
        attachments: [getEmailLogoAttachment()],
      });

      if (error) {
        throw new ServerError(`Error sending teacher invitation email: ${error.message}`);
      }
    } catch (err) {
      if (err instanceof ServerError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new ServerError(`Error sending teacher invitation email: ${message}`);
    }
  }

  public async sendWelcomeEmail(
    email: string,
    name: string,
    role: string,
    locale: Locale = DEFAULT_LOCALE,
  ): Promise<void> {
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

    const templateData = buildWelcomeEmailTemplateData({
      role,
      name,
      appUrl,
      logoUrl: getEmailLogoCid(),
      locale,
    });
    const { html, subject } = renderWelcomeEmail(templateData);

    try {
      const { error } = await this.resend.emails.send({
        from: 'Edesio <noreply@edesio.ai>',
        to: [email],
        subject,
        html,
        attachments: [getEmailLogoAttachment()],
      });

      if (error) {
        throw new ServerError(`Error sending welcome email: ${error.message}`);
      }
    } catch (err) {
      if (err instanceof ServerError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new ServerError(`Error sending welcome email: ${message}`);
    }
  }

  public async sendCancelSubscriptionEmail(params: CancelSubscriptionEmailParams): Promise<void> {
    const { email } = params;
    const { html, subject } = renderCancelSubscriptionEmail(params);

    const { error } = await this.resend.emails.send({
      from: 'Edesio <noreply@edesio.ai>',
      to: [email],
      subject,
      html,
      attachments: [getEmailLogoAttachment()],
    });

    if (error) {
      throw new ServerError(`Error sending cancellation email: ${error.message}`);
    }
  }
}
