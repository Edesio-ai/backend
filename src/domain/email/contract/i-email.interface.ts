import { CancelSubscriptionEmailParams } from 'src/domain/billing/types/billing.type';
import { Locale } from 'src/domain/shared/locale.type';

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER_INTERFACE');

export interface IEmailProvider {
  sendWelcomeEmail(email: string, name: string, role: string, locale?: Locale): Promise<void>;
  sendTeacherInvitation(
    email: string,
    name: string,
    invitationToken: string,
    availableChatbots: number,
    locale?: Locale,
  ): Promise<void>;
  sendCancelSubscriptionEmail(params: CancelSubscriptionEmailParams): Promise<void>;
}
