import { ReactivateSubscriptionUseCase } from './reactivate-subscription.use-case';
import { User } from '../../domain/auth/types/auth.type';
import { IStripeProvider } from '../../domain/billing/contracts/i-stripe-client.provider';

describe('ReactivateSubscriptionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delegate reactivation to stripe with user email', async () => {
    fixtures.whenStripeReactivateResolves();

    await fixtures.whenExecute();

    fixtures.thenReactivateSubscriptionCalledWith(fixtures.user.email);
  });

  it('should propagate stripe error', async () => {
    fixtures.whenStripeReactivateThrows();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowStripeError(promise);
    fixtures.thenReactivateSubscriptionCalledWith(fixtures.user.email);
  });
});

class Fixtures {
  public readonly stripeRepository: jest.Mocked<IStripeProvider>;
  public readonly reactivateSubscriptionUseCase: ReactivateSubscriptionUseCase;

  public readonly user: User;
  public readonly stripeError: Error;

  constructor() {
    this.stripeRepository = {
      getUserSubscription: jest.fn(),
      getCustomerByEmail: jest.fn(),
      getCheckoutSessionByUserId: jest.fn(),
      getSubscriptionsByCustomerId: jest.fn(),
      createCheckoutSession: jest.fn(),
      getCheckoutSession: jest.fn(),
      cancelSubscription: jest.fn(),
      reactivateSubscription: jest.fn(),
    };

    this.reactivateSubscriptionUseCase = new ReactivateSubscriptionUseCase(
      this.stripeRepository,
    );

    this.user = {
      id: 'u-1',
      email: 'owner@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'establishment', firstname: 'Lee' },
    };

    this.stripeError = new Error('stripe reactivate failed');
  }

  whenExecute() {
    return this.reactivateSubscriptionUseCase.execute(this.user);
  }

  whenStripeReactivateResolves() {
    this.stripeRepository.reactivateSubscription.mockResolvedValue(undefined);
  }

  whenStripeReactivateThrows() {
    this.stripeRepository.reactivateSubscription.mockRejectedValue(
      this.stripeError,
    );
  }

  thenReactivateSubscriptionCalledWith(email: string) {
    expect(this.stripeRepository.reactivateSubscription).toHaveBeenCalledWith(
      email,
    );
    expect(this.stripeRepository.reactivateSubscription).toHaveBeenCalledTimes(
      1,
    );
  }

  async thenThrowStripeError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.stripeError);
  }
}
