import { User } from 'src/domain/auth/types/auth.type';
import {
  StripeSession,
  StripeSubscription,
  CancelSubscription,
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
    locale?: 'en' | 'fr',
  ): Promise<any>;
  getCheckoutSession(sessionId: string): Promise<StripeSession>;
  cancelSubscription(user: User): Promise<CancelSubscription>;
  reactivateSubscription(email: string): Promise<void>;
  getCustomerPortalUrl(email: string): Promise<string | null>;
}
