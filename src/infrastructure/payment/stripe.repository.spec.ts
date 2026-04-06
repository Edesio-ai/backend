import { StripeRepository } from './stripe.repository';
import { StripeError } from '../../domain/billing/error';

describe('StripeRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return customers when getCustomerByEmail succeeds', async () => {
    fixtures.whenCustomersListSucceeds();

    const result = await fixtures.whenGetCustomerByEmail();

    fixtures.thenCustomersListCalledWithExpectedArguments();
    fixtures.thenReturnExpectedCustomers(result);
  });

  it('should throw StripeError when getCustomerByEmail fails', async () => {
    fixtures.whenCustomersListThrowsError();

    const promise = fixtures.whenGetCustomerByEmail();

    await fixtures.thenThrowStripeErrorWithMessagePart(
      promise,
      'Error searching customers',
    );
  });

  it('should return customer id from checkout session when found', async () => {
    fixtures.whenCheckoutSessionsListFindsCustomer();

    const result = await fixtures.whenGetCheckoutSessionByUserId();

    fixtures.thenCheckoutSessionsListCalledWithExpectedArguments();
    fixtures.thenReturnExpectedCustomerId(result);
  });

  it('should return null when checkout session has no matching customer', async () => {
    fixtures.whenCheckoutSessionsListReturnsNoMatch();

    const result = await fixtures.whenGetCheckoutSessionByUserId();

    expect(result).toBeNull();
  });

  it('should throw StripeError when getCheckoutSessionByUserId fails', async () => {
    fixtures.whenCheckoutSessionsListThrowsError();

    const promise = fixtures.whenGetCheckoutSessionByUserId();

    await fixtures.thenThrowStripeErrorWithMessagePart(
      promise,
      'Error searching checkout sessions',
    );
  });

  it('should return subscriptions when getSubscriptionsByCustomerId succeeds', async () => {
    fixtures.whenSubscriptionsListSucceeds();

    const result = await fixtures.whenGetSubscriptionsByCustomerId();

    fixtures.thenSubscriptionsListCalledWithExpectedArguments();
    fixtures.thenReturnExpectedSubscriptions(result);
  });

  it('should throw StripeError when getSubscriptionsByCustomerId fails', async () => {
    fixtures.whenSubscriptionsListThrowsError();

    const promise = fixtures.whenGetSubscriptionsByCustomerId();

    await fixtures.thenThrowStripeErrorWithMessagePart(
      promise,
      'Error searching subscriptions',
    );
  });

  it('should return mapped checkout session when retrieve succeeds', async () => {
    fixtures.whenCheckoutSessionRetrieveSucceeds();

    const result = await fixtures.whenGetCheckoutSession();

    fixtures.thenCheckoutSessionRetrieveCalledWithExpectedArguments();
    fixtures.thenReturnMappedCheckoutSession(result);
  });

  it('should throw StripeError when getCheckoutSession fails', async () => {
    fixtures.whenCheckoutSessionRetrieveThrowsError();

    const promise = fixtures.whenGetCheckoutSession();

    await fixtures.thenThrowStripeErrorWithMessagePart(
      promise,
      'Error retrieving checkout session',
    );
  });

  it('should create checkout session and return url when create succeeds', async () => {
    fixtures.whenCreateCheckoutSessionSucceeds();

    const result = await fixtures.whenCreateCheckoutSession();

    fixtures.thenCreateCheckoutSessionCalledWithExpectedArguments();
    fixtures.thenReturnCheckoutUrl(result);
  });

  it('should throw StripeError when createCheckoutSession fails', async () => {
    fixtures.whenCreateCheckoutSessionThrowsError();

    const promise = fixtures.whenCreateCheckoutSession();

    await fixtures.thenThrowStripeErrorWithMessagePart(
      promise,
      'Error creating checkout session',
    );
  });
});

class Fixtures {
  public readonly customersListMock = jest.fn();
  public readonly checkoutSessionsListMock = jest.fn();
  public readonly checkoutSessionsRetrieveMock = jest.fn();
  public readonly checkoutSessionsCreateMock = jest.fn();
  public readonly subscriptionsListMock = jest.fn();
  public readonly stripeRepository: StripeRepository;

  public readonly email = 'owner@school.com';
  public readonly userId = 'user-1';
  public readonly customerId = 'cus_123';
  public readonly checkoutSessionId = 'cs_test_123';
  public readonly priceId = 'price_123';
  public readonly planType = 'pro';
  public readonly customers = [{ id: this.customerId }];
  public readonly subscriptions = [{ id: 'sub_1', status: 'active' }];
  public readonly user = {
    id: this.userId,
    aud: 'authenticated',
    role: 'authenticated',
    email: this.email,
    email_confirmed_at: '2026-01-01T00:00:00.000Z',
    phone: '',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { role: 'establishment' },
    identities: [],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    is_anonymous: false,
  };

  constructor() {
    const stripeClientMock = {
      customers: {
        list: this.customersListMock,
      },
      checkout: {
        sessions: {
          list: this.checkoutSessionsListMock,
          retrieve: this.checkoutSessionsRetrieveMock,
          create: this.checkoutSessionsCreateMock,
        },
      },
      subscriptions: {
        list: this.subscriptionsListMock,
      },
    };

    this.stripeRepository = new StripeRepository(stripeClientMock as any);
  }

  whenGetCustomerByEmail() {
    return this.stripeRepository.getCustomerByEmail(this.email);
  }

  whenGetCheckoutSessionByUserId() {
    return this.stripeRepository.getCheckoutSessionByUserId(this.userId);
  }

  whenGetSubscriptionsByCustomerId() {
    return this.stripeRepository.getSubscriptionsByCustomerId(this.customerId);
  }

  whenGetCheckoutSession() {
    return this.stripeRepository.getCheckoutSession(this.checkoutSessionId);
  }

  whenCreateCheckoutSession() {
    return this.stripeRepository.createCheckoutSession(
      this.user as any,
      this.priceId,
      this.planType,
    );
  }

  whenCustomersListSucceeds() {
    this.customersListMock.mockResolvedValue({ data: this.customers });
  }

  whenCustomersListThrowsError() {
    this.customersListMock.mockRejectedValue(
      new Error('stripe customer failure'),
    );
  }

  whenCheckoutSessionsListFindsCustomer() {
    this.checkoutSessionsListMock.mockResolvedValue({
      data: [
        {
          client_reference_id: this.userId,
          customer: this.customerId,
        },
      ],
    });
  }

  whenCheckoutSessionsListReturnsNoMatch() {
    this.checkoutSessionsListMock.mockResolvedValue({
      data: [
        {
          client_reference_id: 'another-user',
          customer: 'cus_other',
        },
      ],
    });
  }

  whenCheckoutSessionsListThrowsError() {
    this.checkoutSessionsListMock.mockRejectedValue(
      new Error('stripe session failure'),
    );
  }

  whenSubscriptionsListSucceeds() {
    this.subscriptionsListMock.mockResolvedValue({ data: this.subscriptions });
  }

  whenSubscriptionsListThrowsError() {
    this.subscriptionsListMock.mockRejectedValue(
      new Error('stripe subscription failure'),
    );
  }

  whenCheckoutSessionRetrieveSucceeds() {
    this.checkoutSessionsRetrieveMock.mockResolvedValue({
      id: this.checkoutSessionId,
      customer: this.customerId,
      subscription: 'sub_123',
      status: 'complete',
      payment_status: 'paid',
      metadata: { plan: this.planType },
    });
  }

  whenCheckoutSessionRetrieveThrowsError() {
    this.checkoutSessionsRetrieveMock.mockRejectedValue(
      new Error('retrieve failure'),
    );
  }

  whenCreateCheckoutSessionSucceeds() {
    this.checkoutSessionsCreateMock.mockResolvedValue({
      url: 'https://stripe.test/checkout',
    });
  }

  whenCreateCheckoutSessionThrowsError() {
    this.checkoutSessionsCreateMock.mockRejectedValue(
      new Error('create failure'),
    );
  }

  async thenThrowStripeErrorWithMessagePart(
    promise: Promise<unknown>,
    messagePart: string,
  ) {
    await expect(promise).rejects.toBeInstanceOf(StripeError);
    await expect(promise).rejects.toThrow(messagePart);
  }

  thenCustomersListCalledWithExpectedArguments() {
    expect(this.customersListMock).toHaveBeenCalledWith({
      email: this.email,
      limit: 1,
    });
    expect(this.customersListMock).toHaveBeenCalledTimes(1);
  }

  thenCheckoutSessionsListCalledWithExpectedArguments() {
    expect(this.checkoutSessionsListMock).toHaveBeenCalledWith({ limit: 20 });
    expect(this.checkoutSessionsListMock).toHaveBeenCalledTimes(1);
  }

  thenSubscriptionsListCalledWithExpectedArguments() {
    expect(this.subscriptionsListMock).toHaveBeenCalledWith({
      customer: this.customerId,
      limit: 10,
    });
    expect(this.subscriptionsListMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedCustomers(result: any) {
    expect(result).toEqual(this.customers);
  }

  thenReturnExpectedCustomerId(result: any) {
    expect(result).toEqual(this.customerId);
  }

  thenReturnExpectedSubscriptions(result: any) {
    expect(result).toEqual(this.subscriptions);
  }

  thenCheckoutSessionRetrieveCalledWithExpectedArguments() {
    expect(this.checkoutSessionsRetrieveMock).toHaveBeenCalledWith(
      this.checkoutSessionId,
    );
    expect(this.checkoutSessionsRetrieveMock).toHaveBeenCalledTimes(1);
  }

  thenReturnMappedCheckoutSession(result: any) {
    expect(result).toEqual({
      id: this.checkoutSessionId,
      customerId: this.customerId,
      subscriptionId: 'sub_123',
      status: 'complete',
      paymentStatus: 'paid',
      metadata: { plan: this.planType },
    });
  }

  thenCreateCheckoutSessionCalledWithExpectedArguments() {
    expect(this.checkoutSessionsCreateMock).toHaveBeenCalledWith({
      mode: 'subscription',
      customer_email: this.email,
      line_items: [
        {
          price: this.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan: this.planType,
      },
      subscription_data: {
        metadata: {
          plan: this.planType,
          priceId: this.priceId,
        },
      },
      success_url: `${process.env.STRIPE_REDIRECT_URI}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.STRIPE_REDIRECT_URI}/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });
    expect(this.checkoutSessionsCreateMock).toHaveBeenCalledTimes(1);
  }

  thenReturnCheckoutUrl(result: any) {
    expect(result).toEqual({ url: 'https://stripe.test/checkout' });
  }
}
