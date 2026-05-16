import type { IStripeProvider } from 'src/domain/billing/contracts/i-stripe-client.provider';

export function createMockStripeProvider(): jest.Mocked<IStripeProvider> {
  return {
    getUserSubscription: jest.fn(),
    getCustomerByEmail: jest.fn(),
    getCheckoutSessionByUserId: jest.fn(),
    getSubscriptionsByCustomerId: jest.fn(),
    createCheckoutSession: jest.fn(),
    getCheckoutSession: jest.fn(),
    cancelSubscription: jest.fn(),
    reactivateSubscription: jest.fn(),
    getCustomerPortalUrl: jest.fn(),
  };
}
