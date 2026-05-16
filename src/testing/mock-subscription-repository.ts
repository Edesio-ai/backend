import type { ISubscriptionRepository } from 'src/domain/subscription/contracts/i-subscription.repository';

export function createMockSubscriptionRepository(): jest.Mocked<ISubscriptionRepository> {
  return {
    getUserSubscription: jest.fn(),
  };
}
