import { GetSubscriptionUseCase } from './get-subscription.use-case';
import type { IStripeProvider } from 'src/domain/billing/contracts/i-stripe-client.provider';
import { StripeSubscription } from 'src/domain/billing/types/billing.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';

describe('GetSubscriptionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delegate to stripe repository with user email', async () => {
    fixtures.whenStripeReturnsSubscription();

    const result = await fixtures.whenExecute();

    expect(fixtures.stripeRepository.getUserSubscription).toHaveBeenCalledWith(
      fixtures.user.email,
    );
    expect(result).toEqual(fixtures.subscription);
  });

  it('should return null when repository returns null', async () => {
    fixtures.whenStripeReturnsNull();

    const result = await fixtures.whenExecute();

    expect(result).toBeNull();
  });

  it('should propagate repository errors', async () => {
    const err = new Error('stripe unavailable');
    fixtures.stripeRepository.getUserSubscription.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly stripeRepository: jest.Mocked<IStripeProvider>;
  public readonly useCase: GetSubscriptionUseCase;

  public readonly user: AuthUser = {
    id: 'u-1',
    email: 'bill@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'establishment' },
  };

  public readonly subscription: StripeSubscription = {
    id: 'sub_x',
    status: 'active',
    plan: 'Pro',
    interval: 'month',
    amount: 1000,
    currency: 'eur',
    currentPeriodEnd: 1780857684,
    cancelAtPeriodEnd: false,
    last4: '4242',
    cardBrand: 'visa',
  };

  constructor() {
    this.stripeRepository = {
      getUserSubscription: jest.fn(),
      getCustomerByEmail: jest.fn(),
      getCheckoutSessionByUserId: jest.fn(),
      getSubscriptionsByCustomerId: jest.fn(),
      createCheckoutSession: jest.fn(),
      getCheckoutSession: jest.fn(),
    };

    this.useCase = new GetSubscriptionUseCase(this.stripeRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.user);
  }

  whenStripeReturnsSubscription() {
    this.stripeRepository.getUserSubscription.mockResolvedValue(
      this.subscription,
    );
  }

  whenStripeReturnsNull() {
    this.stripeRepository.getUserSubscription.mockResolvedValue(null);
  }
}
