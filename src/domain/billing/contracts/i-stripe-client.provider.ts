import { User } from 'src/domain/auth/types/auth.type';
import {
  StripeSession,
  StripeSubscription,
  CancelSubscription,
  StripeCustomer,
  StripeSubscriptionsLookup,
  CheckoutSessionCreateResult,
} from 'src/domain/billing/types/billing.type';
import { Locale } from 'src/domain/shared/locale.type';

export const STRIPE_PROVIDER = Symbol('STRIPE_PROVIDER');

export interface IStripeProvider {
  getUserSubscription(email: string): Promise<StripeSubscription | null>;
  getCustomerByEmail(email: string): Promise<StripeCustomer[]>;
  getCheckoutSessionByUserId(userId: string): Promise<string | null>;
  getSubscriptionsByCustomerId(customerId: string): Promise<StripeSubscriptionsLookup>;
  createCheckoutSession(
    user: User,
    priceId: string,
    planType: string,
    locale?: Locale,
  ): Promise<CheckoutSessionCreateResult>;
  getCheckoutSession(sessionId: string): Promise<StripeSession>;
  cancelSubscription(user: User, locale?: Locale): Promise<CancelSubscription>;
  reactivateSubscription(email: string): Promise<void>;
  getCustomerPortalUrl(email: string): Promise<string | null>;
}
