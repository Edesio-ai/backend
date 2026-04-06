import { User } from 'src/domain/auth/auth.type';
import { StripeSession } from 'src/domain/billing/billing.type';

export const PAYMENT_CLIENT = Symbol('PAYMENT_CLIENT');

export interface PaymentClientInterface {
  getCustomerByEmail(email: string): Promise<any>;
  getCheckoutSessionByUserId(userId: string): Promise<string | null>;
  getSubscriptionsByCustomerId(customerId: string): Promise<any>;
  createCheckoutSession(
    user: User,
    priceId: string,
    planType: string,
  ): Promise<any>;
  getCheckoutSession(sessionId: string): Promise<StripeSession>;
}
