export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface ISubscriptionRepository {
  getUserSubscription(userId: string): Promise<any>;
}
