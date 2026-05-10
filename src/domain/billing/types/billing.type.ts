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
