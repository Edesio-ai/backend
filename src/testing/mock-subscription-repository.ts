import type { SubscriptionRepository } from 'src/domain/subscription/contracts/subscription.repository';

export function createMockSubscriptionRepository(): jest.Mocked<SubscriptionRepository> {
  return {
    getUserSubscription: jest.fn(),
  };
}
