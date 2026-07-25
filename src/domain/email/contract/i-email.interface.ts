import { CancelSubscriptionEmailParams } from 'src/domain/billing/types/billing.type';

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER_INTERFACE');

export interface IEmailProvider {
  sendWelcomeEmail(email: string, name: string, role: string): Promise<void>;
  sendProfesseurInvitation(
    email: string,
    name: string,
    invitationToken: string,
    availableChatbots: number,
  ): Promise<void>;
  sendCancelSubscriptionEmail(params: CancelSubscriptionEmailParams): Promise<void>;
}
