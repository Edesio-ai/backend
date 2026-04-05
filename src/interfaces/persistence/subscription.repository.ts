export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface SubscriptionRepository {
    getUserSubscription(userId: string): Promise<any>;
}