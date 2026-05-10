import { User } from 'src/domain/auth/types/auth.type';
import { StripeSession } from 'src/domain/billing/types/billing.type';

export const STRIPE_CLIENT_INTERFACE = Symbol('STRIPE_CLIENT_INTERFACE');

export interface IStripeClientProvider {
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
