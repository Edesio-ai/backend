export type SubscriptionStatus = {
  hasActiveSubscription: boolean;
  role: string;
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
  currentPeriodEnd: number;
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
};
