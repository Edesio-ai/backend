import { CreateCheckoutSessionsUseCase } from './create-checkout-session.use-case';
import { StripeClientInterface } from '../../domain/billing/contracts/stripe-client.interface';
import { SubscriptionRepository } from '../../domain/teaching/interface/subscription.repository';
import { User } from '../../domain/auth/types/auth.type';
import { TokenUserNotFoundError } from '../../domain/auth/errors/auth.errors';

describe('CreateCheckoutSessionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw TokenUserNotFoundError when user is missing', async () => {
    const promise = fixtures.whenExecuteWith(
      fixtures.priceId,
      fixtures.planType,
      null as unknown as User,
    );

    await fixtures.thenThrowTokenUserNotFound(promise);
    fixtures.thenRepositoriesNotCalled();
  });

  it('should return existing checkout url when subscription already exists', async () => {
    fixtures.whenSubscriptionRepositoryReturnsExistingSubscription();

    const result = await fixtures.whenExecuteWith(
      fixtures.priceId,
      fixtures.planType,
      fixtures.user,
    );

    fixtures.thenSubscriptionLookupCalledWithUserId();
    fixtures.thenCreateCheckoutSessionNotCalled();
    fixtures.thenReturnExistingCheckoutUrl(result);
  });

  it('should create checkout session when no subscription exists', async () => {
    fixtures.whenSubscriptionRepositoryReturnsNull();
    fixtures.whenPaymentClientReturnsCheckoutUrl();

    const result = await fixtures.whenExecuteWith(
      fixtures.priceId,
      fixtures.planType,
      fixtures.user,
    );

    fixtures.thenSubscriptionLookupCalledWithUserId();
    fixtures.thenCreateCheckoutSessionCalledWithExpectedArguments();
    fixtures.thenReturnNewCheckoutUrl(result);
  });

  it('should propagate repository error', async () => {
    fixtures.whenSubscriptionRepositoryThrowsError();

    const promise = fixtures.whenExecuteWith(
      fixtures.priceId,
      fixtures.planType,
      fixtures.user,
    );

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenCreateCheckoutSessionNotCalled();
  });
});

class Fixtures {
  public readonly subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  public readonly paymentClient: jest.Mocked<StripeClientInterface>;
  public readonly createCheckoutSessionsUseCase: CreateCheckoutSessionsUseCase;

  public readonly user: User;
  public readonly priceId: string;
  public readonly planType: string;
  public readonly existingSubscription: { checkout_url: string };
  public readonly newCheckoutSessionPayload: { url: string };
  public readonly repositoryError: Error;

  constructor() {
    this.subscriptionRepository = {
      getUserSubscription: jest.fn(),
    };
    this.paymentClient = {
      getCustomerByEmail: jest.fn(),
      getCheckoutSessionByUserId: jest.fn(),
      getSubscriptionsByCustomerId: jest.fn(),
      createCheckoutSession: jest.fn(),
      getCheckoutSession: jest.fn(),
    };

    this.createCheckoutSessionsUseCase = new CreateCheckoutSessionsUseCase(
      this.subscriptionRepository,
      this.paymentClient,
    );

    this.user = {
      id: 'user-1',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'owner@school.com',
      email_confirmed_at: '2026-01-01T00:00:00.000Z',
      phone: '',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { role: 'establishment' },
      identities: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      is_anonymous: false,
    };
    this.priceId = 'price_123';
    this.planType = 'pro';
    this.existingSubscription = { checkout_url: 'https://checkout.existing' };
    this.newCheckoutSessionPayload = { url: 'https://checkout.new' };
    this.repositoryError = new Error('database down');
  }

  whenExecuteWith(
    priceId: string,
    planType: string,
    user: User,
  ): Promise<unknown> {
    return this.createCheckoutSessionsUseCase.execute(priceId, planType, user);
  }

  whenSubscriptionRepositoryReturnsExistingSubscription() {
    this.subscriptionRepository.getUserSubscription.mockResolvedValue(
      this.existingSubscription,
    );
  }

  whenSubscriptionRepositoryReturnsNull() {
    this.subscriptionRepository.getUserSubscription.mockResolvedValue(null);
  }

  whenSubscriptionRepositoryThrowsError() {
    this.subscriptionRepository.getUserSubscription.mockRejectedValue(
      this.repositoryError,
    );
  }

  whenPaymentClientReturnsCheckoutUrl() {
    this.paymentClient.createCheckoutSession.mockResolvedValue(
      this.newCheckoutSessionPayload,
    );
  }

  async thenThrowTokenUserNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(TokenUserNotFoundError);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenRepositoriesNotCalled() {
    expect(
      this.subscriptionRepository.getUserSubscription,
    ).not.toHaveBeenCalled();
    expect(this.paymentClient.createCheckoutSession).not.toHaveBeenCalled();
  }

  thenSubscriptionLookupCalledWithUserId() {
    expect(
      this.subscriptionRepository.getUserSubscription,
    ).toHaveBeenCalledWith(this.user.id);
    expect(
      this.subscriptionRepository.getUserSubscription,
    ).toHaveBeenCalledTimes(1);
  }

  thenCreateCheckoutSessionCalledWithExpectedArguments() {
    expect(this.paymentClient.createCheckoutSession).toHaveBeenCalledWith(
      this.user,
      this.priceId,
      this.planType,
    );
    expect(this.paymentClient.createCheckoutSession).toHaveBeenCalledTimes(1);
  }

  thenCreateCheckoutSessionNotCalled() {
    expect(this.paymentClient.createCheckoutSession).not.toHaveBeenCalled();
  }

  thenReturnExistingCheckoutUrl(result: unknown) {
    expect(result).toEqual({
      checkoutUrl: this.existingSubscription.checkout_url,
    });
  }

  thenReturnNewCheckoutUrl(result: unknown) {
    expect(result).toEqual(this.newCheckoutSessionPayload);
  }
}
