import { User } from 'src/domain/auth/types/auth.type';
import {
  StripeSession,
  StripeSubscription,
} from 'src/domain/billing/types/billing.type';

export const STRIPE_PROVIDER = Symbol('STRIPE_PROVIDER');

export interface IStripeProvider {
  getUserSubscription(email: string): Promise<StripeSubscription | null>;
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
