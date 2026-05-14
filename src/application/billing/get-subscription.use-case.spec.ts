import { GetSubscriptionUseCase } from './get-subscription.use-case';
import { IStripeProvider } from '../../domain/billing/contracts/i-stripe-client.provider';
import { StripeSubscription } from '../../domain/billing/types/billing.type';
import { User } from '../../domain/auth/types/auth.type';

describe('GetSubscriptionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return subscription from stripe repository for user email', async () => {
    fixtures.whenStripeReturnsSubscription();

    const result = await fixtures.whenExecute();

    fixtures.thenGetUserSubscriptionCalledWithEmail();
    fixtures.thenReturnsExpectedSubscription(result);
  });

  it('should return null when repository returns null', async () => {
    fixtures.whenStripeReturnsNull();

    const result = await fixtures.whenExecute();

    fixtures.thenReturnsNull(result);
    fixtures.thenGetUserSubscriptionCalledWithEmail();
  });

  it('should propagate repository error', async () => {
    fixtures.whenStripeThrowsError();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenGetUserSubscriptionCalledWithEmail();
  });
});

class Fixtures {
  public readonly stripeRepository: jest.Mocked<IStripeProvider>;
  public readonly getSubscriptionUseCase: GetSubscriptionUseCase;

  public readonly user: User;
  public readonly subscription: StripeSubscription;
  public readonly repositoryError: Error;

  constructor() {
    this.stripeRepository = {
      getUserSubscription: jest.fn(),
      getCustomerByEmail: jest.fn(),
      getCheckoutSessionByUserId: jest.fn(),
      getSubscriptionsByCustomerId: jest.fn(),
      createCheckoutSession: jest.fn(),
      getCheckoutSession: jest.fn(),
    };

    this.getSubscriptionUseCase = new GetSubscriptionUseCase(
      this.stripeRepository,
    );

    this.user = {
      id: 'u-1',
      email: 'bill@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'establishment' },
    };

    this.subscription = {
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

    this.repositoryError = new Error('stripe unavailable');
  }

  whenExecute() {
    return this.getSubscriptionUseCase.execute(this.user);
  }

  whenStripeReturnsSubscription() {
    this.stripeRepository.getUserSubscription.mockResolvedValue(
      this.subscription,
    );
  }

  whenStripeReturnsNull() {
    this.stripeRepository.getUserSubscription.mockResolvedValue(null);
  }

  whenStripeThrowsError() {
    this.stripeRepository.getUserSubscription.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenGetUserSubscriptionCalledWithEmail() {
    expect(this.stripeRepository.getUserSubscription).toHaveBeenCalledWith(
      this.user.email,
    );
    expect(this.stripeRepository.getUserSubscription).toHaveBeenCalledTimes(1);
  }

  thenReturnsExpectedSubscription(result: StripeSubscription | null) {
    expect(result).toEqual(this.subscription);
  }

  thenReturnsNull(result: StripeSubscription | null) {
    expect(result).toBeNull();
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
