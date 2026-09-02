import { Locale } from 'src/domain/shared/locale.type';

export type SubscriptionStatus = {
  hasActiveSubscription: boolean;
  role: string;
  status?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: number;
  isPending?: boolean;
};

export type StripeCustomer = {
  id: string;
};

export type StripeSubscriptionLookupItem = {
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: number;
  cancel_at?: number | null;
};

/** Array of subscriptions that may also expose a `.data` list (legacy dual shape). */
export type StripeSubscriptionsLookup = StripeSubscriptionLookupItem[] & {
  data: StripeSubscriptionLookupItem[];
};

export type CheckoutSessionCreateResult = {
  url: string;
};

export type CheckoutSessionExistingResult = {
  checkoutUrl: string;
};

export type UserSubscriptionRecord = {
  checkout_url: string;
};

export type StripeSession = {
  id: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  paymentStatus: string;
  metadata: Record<string, string>;
};

export type StripeSubscription = {
  id: string;
  status: string;
  plan: string;
  interval: string;
  amount: number;
  currency: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd: boolean;
  last4: string | null;
  cardBrand: string | null;
  isEstablishmentSubscription?: boolean;
};

export type CancelSubscription = {
  planName: string;
  endDate: string;
};

export type CancelSubscriptionEmailParams = CancelSubscription & {
  email: string;
  firstname: string;
  locale?: Locale;
};
