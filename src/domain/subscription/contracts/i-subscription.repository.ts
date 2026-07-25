import { UserSubscriptionRecord } from 'src/domain/billing/types/billing.type';

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface ISubscriptionRepository {
  getUserSubscription(userId: string): Promise<UserSubscriptionRecord | null>;
}
