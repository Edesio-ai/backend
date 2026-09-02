import Stripe from 'stripe';
import { User } from 'src/domain/auth/types/auth.type';
import { CancelSubscription, StripeSubscription } from 'src/domain/billing/types/billing.type';
import { StripeRepository } from './stripe.repository';
import { ServerError } from '../../../../domain/shared/errors/global.errors';

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

  it('should throw ServerError when getCustomerByEmail fails', async () => {
    fixtures.whenCustomersListThrowsError();

    const promise = fixtures.whenGetCustomerByEmail();

    await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Error searching customers');
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

  it('should throw ServerError when getCheckoutSessionByUserId fails', async () => {
    fixtures.whenCheckoutSessionsListThrowsError();

    const promise = fixtures.whenGetCheckoutSessionByUserId();

    await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Error searching checkout sessions');
  });

  it('should return subscriptions when getSubscriptionsByCustomerId succeeds', async () => {
    fixtures.whenSubscriptionsListSucceeds();

    const result = await fixtures.whenGetSubscriptionsByCustomerId();

    fixtures.thenSubscriptionsListCalledWithExpectedArguments();
    fixtures.thenReturnExpectedSubscriptions(result);
  });

  it('should throw ServerError when getSubscriptionsByCustomerId fails', async () => {
    fixtures.whenSubscriptionsListThrowsError();

    const promise = fixtures.whenGetSubscriptionsByCustomerId();

    await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Error searching subscriptions');
  });

  it('should return mapped checkout session when retrieve succeeds', async () => {
    fixtures.whenCheckoutSessionRetrieveSucceeds();

    const result = await fixtures.whenGetCheckoutSession();

    fixtures.thenCheckoutSessionRetrieveCalledWithExpectedArguments();
    fixtures.thenReturnMappedCheckoutSession(result);
  });

  it('should throw ServerError when getCheckoutSession fails', async () => {
    fixtures.whenCheckoutSessionRetrieveThrowsError();

    const promise = fixtures.whenGetCheckoutSession();

    await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Error retrieving checkout session');
  });

  it('should create checkout session and return url when create succeeds', async () => {
    fixtures.whenCreateCheckoutSessionSucceeds();

    const result = await fixtures.whenCreateCheckoutSession();

    fixtures.thenCreateCheckoutSessionCalledWithExpectedArguments();
    fixtures.thenReturnCheckoutUrl(result);
  });

  it('should throw ServerError when createCheckoutSession fails', async () => {
    fixtures.whenCreateCheckoutSessionThrowsError();

    const promise = fixtures.whenCreateCheckoutSession();

    await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Error creating checkout session');
  });

  describe('getUserSubscription', () => {
    it('should return mapped subscription with period_end from invoice preview', async () => {
      fixtures.whenGetUserSubscriptionFullChainSucceeds();

      const result = await fixtures.whenGetUserSubscription();

      expect(result).toEqual(fixtures.expectedStripeSubscription);
      expect(fixtures.subscriptionsListMock).toHaveBeenCalledWith({
        customer: fixtures.customerId,
        status: 'active',
        limit: 1,
      });
      expect(fixtures.invoicesCreatePreviewMock).toHaveBeenCalledWith({
        customer: fixtures.customerId,
        subscription: fixtures.subscriptionRow.id,
      });
    });

    it('should return null when customer is not found', async () => {
      fixtures.whenCustomersListEmpty();

      const result = await fixtures.whenGetUserSubscription();

      expect(result).toBeNull();
      expect(fixtures.subscriptionsListMock).not.toHaveBeenCalled();
      expect(fixtures.invoicesCreatePreviewMock).not.toHaveBeenCalled();
    });

    it('should return null when subscription list is empty', async () => {
      fixtures.whenCustomersListReturnsOneCustomer();
      fixtures.whenSubscriptionsListEmpty();

      const result = await fixtures.whenGetUserSubscription();

      expect(result).toBeNull();
      expect(fixtures.invoicesCreatePreviewMock).not.toHaveBeenCalled();
    });

    it('should omit card details when subscription has no default payment method', async () => {
      fixtures.whenCustomersListReturnsOneCustomer();
      fixtures.whenSubscriptionWithoutPaymentMethod();
      fixtures.whenProductsRetrieveSucceeds();
      fixtures.whenCreatePreviewSucceeds();

      const result = await fixtures.whenGetUserSubscription();

      expect(fixtures.paymentMethodsRetrieveMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...fixtures.expectedStripeSubscription,
        last4: null,
        cardBrand: null,
      });
    });

    it('should fall back when createPreview fails', async () => {
      fixtures.whenGetUserSubscriptionUntilPreview();
      fixtures.whenCreatePreviewThrows();

      const result = await fixtures.whenGetUserSubscription();

      expect(fixtures.invoicesCreatePreviewMock).toHaveBeenCalledWith({
        customer: fixtures.customerId,
        subscription: fixtures.subscriptionRow.id,
      });
      expect(result).toEqual({
        ...fixtures.expectedStripeSubscription,
        currentPeriodEnd: undefined,
      });
    });
  });

  describe('cancelSubscription', () => {
    it('should set cancel_at_period_end and return plan name with formatted end date', async () => {
      fixtures.whenCancelSubscriptionSucceeds();

      const result = await fixtures.whenCancelSubscription();

      fixtures.thenCancelSubscriptionStripeCallsSucceeded();
      expect(result).toEqual(fixtures.expectedCancelSubscription);
    });

    it('should format end date in English when locale is en', async () => {
      fixtures.whenCancelSubscriptionSucceeds();

      const result = await fixtures.whenCancelSubscriptionWithLocale('en');

      expect(result.endDate).toBe(fixtures.expectedCancelSubscriptionEn.endDate);
      expect(result.planName).toBe(fixtures.expectedCancelSubscriptionEn.planName);
    });

    it('should throw ServerError when customer is not found', async () => {
      fixtures.whenCustomersListEmpty();

      const promise = fixtures.whenCancelSubscription();

      await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Customer not found');
      fixtures.thenSubscriptionsUpdateNotCalled();
    });

    it('should throw ServerError when no active subscription exists', async () => {
      fixtures.whenCustomersListReturnsOneCustomer();
      fixtures.whenCancelSubscriptionActiveListEmpty();

      const promise = fixtures.whenCancelSubscription();

      await fixtures.thenThrowServerErrorWithMessagePart(promise, 'No active subscription found');
      fixtures.thenSubscriptionsUpdateNotCalled();
    });

    it('should use default plan name when product retrieve fails', async () => {
      fixtures.whenCancelSubscriptionSucceedsExceptProduct();

      const result = await fixtures.whenCancelSubscription();

      expect(result.planName).toBe('Abonnement Edesio');
      expect(result.endDate).toBe(fixtures.expectedCancelSubscription.endDate);
    });

    it('should throw ServerError when subscription update fails', async () => {
      fixtures.whenCancelSubscriptionUntilUpdate();
      fixtures.whenSubscriptionsUpdateThrows();

      const promise = fixtures.whenCancelSubscription();

      await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Error canceling subscription');
    });
  });

  describe('reactivateSubscription', () => {
    it('should clear cancel_at_period_end on latest subscription', async () => {
      fixtures.whenReactivateFlowSucceeds();

      await fixtures.whenReactivateSubscription();

      fixtures.thenReactivateSubscriptionStripeCallsSucceeded();
    });

    it('should throw ServerError when customer is not found', async () => {
      fixtures.whenCustomersListEmpty();

      const promise = fixtures.whenReactivateSubscription();

      await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Customer not found');
      fixtures.thenSubscriptionsUpdateNotCalled();
    });

    it('should throw ServerError when no subscription exists', async () => {
      fixtures.whenCustomersListReturnsOneCustomer();
      fixtures.whenReactivateSubscriptionsListEmpty();

      const promise = fixtures.whenReactivateSubscription();

      await fixtures.thenThrowServerErrorWithMessagePart(promise, 'No active subscription found');
      fixtures.thenSubscriptionsUpdateNotCalled();
    });

    it('should throw ServerError when subscription update fails', async () => {
      fixtures.whenReactivateFlowSucceeds();
      fixtures.whenSubscriptionsUpdateThrows();

      const promise = fixtures.whenReactivateSubscription();

      await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Error reactivating subscription');
    });
  });

  describe('getCustomerPortalUrl', () => {
    const originalFrontendUrl = process.env.FRONTEND_URL;

    beforeEach(() => {
      process.env.FRONTEND_URL = 'https://app.portal.test';
    });

    afterEach(() => {
      process.env.FRONTEND_URL = originalFrontendUrl;
    });

    it('should create billing portal session and return URL', async () => {
      fixtures.whenCustomerPortalFlowSucceeds();

      const result = await fixtures.whenGetCustomerPortalUrl();

      fixtures.thenBillingPortalSessionCreatedWithExpectedArguments();
      expect(result).toBe('https://billing.stripe.test/portal');
    });

    it('should throw ServerError when customer is not found', async () => {
      fixtures.whenCustomersListEmpty();

      const promise = fixtures.whenGetCustomerPortalUrl();

      await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Customer not found');
      fixtures.thenBillingPortalSessionCreateNotCalled();
    });

    it('should throw ServerError when portal session creation fails', async () => {
      fixtures.whenCustomersListReturnsOneCustomer();
      fixtures.whenBillingPortalSessionThrows();

      const promise = fixtures.whenGetCustomerPortalUrl();

      await fixtures.thenThrowServerErrorWithMessagePart(promise, 'Error getting customer portal url');
    });
  });
});

class Fixtures {
  public readonly customersListMock = jest.fn();
  public readonly checkoutSessionsListMock = jest.fn();
  public readonly checkoutSessionsRetrieveMock = jest.fn();
  public readonly checkoutSessionsCreateMock = jest.fn();
  public readonly subscriptionsListMock = jest.fn();
  public readonly productsRetrieveMock = jest.fn();
  public readonly paymentMethodsRetrieveMock = jest.fn();
  public readonly invoicesCreatePreviewMock = jest.fn();
  public readonly subscriptionsUpdateMock = jest.fn();
  public readonly billingPortalSessionsCreateMock = jest.fn();
  public readonly stripeRepository: StripeRepository;

  public readonly cancelDomainUser: User = {
    id: 'user-1',
    email: 'owner@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'establishment', firstname: 'Pat' },
  };

  public expectedCancelSubscription: CancelSubscription = {
    planName: '',
    endDate: '',
  };

  public expectedCancelSubscriptionEn: CancelSubscription = {
    planName: '',
    endDate: '',
  };

  public readonly subscriptionRow = {
    id: 'sub_abc',
    status: 'active',
    cancel_at_period_end: false,
    items: {
      data: [
        {
          price: {
            unit_amount: 29990,
            currency: 'eur',
            recurring: { interval: 'month' as const },
            product: 'prod_setup',
          },
        },
      ],
    },
    default_payment_method: 'pm_xyz',
  };

  public readonly expectedStripeSubscription: StripeSubscription = {
    id: 'sub_abc',
    status: 'active',
    plan: 'Mode Etablissement',
    interval: 'month',
    amount: 29990,
    currency: 'eur',
    currentPeriodEnd: 1780857684,
    cancelAtPeriodEnd: false,
    last4: '4242',
    cardBrand: 'visa',
  };

  public readonly email = 'owner@school.com';
  public readonly userId = 'user-1';
  public readonly customerId = 'cus_123';
  public readonly checkoutSessionId = 'cs_test_123';
  public readonly priceId = 'price_123';
  public readonly planType = 'pro';
  public readonly customers = [{ id: this.customerId }];
  public readonly subscriptions = [{ id: 'sub_1', status: 'active' }];
  public readonly user: User = {
    id: this.userId,
    email: this.email,
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'establishment' },
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
        update: this.subscriptionsUpdateMock,
      },
      products: {
        retrieve: this.productsRetrieveMock,
      },
      paymentMethods: {
        retrieve: this.paymentMethodsRetrieveMock,
      },
      invoices: {
        createPreview: this.invoicesCreatePreviewMock,
      },
      billingPortal: {
        sessions: {
          create: this.billingPortalSessionsCreateMock,
        },
      },
    };

    this.stripeRepository = new StripeRepository(stripeClientMock as unknown as Stripe);
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
    return this.stripeRepository.createCheckoutSession(this.user, this.priceId, this.planType);
  }

  whenGetUserSubscription() {
    return this.stripeRepository.getUserSubscription(this.email);
  }

  whenCancelSubscription() {
    return this.stripeRepository.cancelSubscription(this.cancelDomainUser);
  }

  whenCancelSubscriptionWithLocale(locale: 'en' | 'fr') {
    return this.stripeRepository.cancelSubscription(this.cancelDomainUser, locale);
  }

  whenReactivateSubscription() {
    return this.stripeRepository.reactivateSubscription(this.email);
  }

  whenGetCustomerPortalUrl() {
    return this.stripeRepository.getCustomerPortalUrl(this.email);
  }

  whenCustomerPortalFlowSucceeds() {
    this.whenCustomersListReturnsOneCustomer();
    this.billingPortalSessionsCreateMock.mockResolvedValue({
      url: 'https://billing.stripe.test/portal',
    });
  }

  whenBillingPortalSessionThrows() {
    this.billingPortalSessionsCreateMock.mockRejectedValue(new Error('portal session failed'));
  }

  whenReactivateFlowSucceeds() {
    this.whenCustomersListReturnsOneCustomer();
    this.subscriptionsListMock.mockResolvedValue({
      data: [{ id: 'sub_reactivate_1' }],
    });
    this.subscriptionsUpdateMock.mockResolvedValue({});
  }

  whenReactivateSubscriptionsListEmpty() {
    this.subscriptionsListMock.mockResolvedValue({ data: [] });
  }

  whenCancelSubscriptionSucceeds() {
    const endTs = 1735689600;
    this.whenCustomersListReturnsOneCustomer();
    this.subscriptionsListMock.mockResolvedValue({
      data: [
        {
          id: 'sub_cancel_1',
          items: {
            data: [{ price: { product: 'prod_cancel_x' } }],
          },
        },
      ],
    });
    this.subscriptionsUpdateMock.mockResolvedValue({
      cancel_at: endTs,
    });
    this.productsRetrieveMock.mockResolvedValue({ name: 'Offre Campus' });
    this.expectedCancelSubscription = {
      planName: 'Offre Campus',
      endDate: new Date(endTs * 1000).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
    this.expectedCancelSubscriptionEn = {
      planName: 'Offre Campus',
      endDate: new Date(endTs * 1000).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }

  whenCancelSubscriptionActiveListEmpty() {
    this.subscriptionsListMock.mockResolvedValue({ data: [] });
  }

  whenCancelSubscriptionSucceedsExceptProduct() {
    const endTs = 1735689600;
    this.whenCustomersListReturnsOneCustomer();
    this.subscriptionsListMock.mockResolvedValue({
      data: [
        {
          id: 'sub_cancel_1',
          items: {
            data: [{ price: { product: 'prod_cancel_x' } }],
          },
        },
      ],
    });
    this.subscriptionsUpdateMock.mockResolvedValue({
      cancel_at: endTs,
    });
    this.productsRetrieveMock.mockRejectedValue(new Error('product down'));
    this.expectedCancelSubscription = {
      planName: 'Abonnement Edesio',
      endDate: new Date(endTs * 1000).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }

  whenCancelSubscriptionUntilUpdate() {
    this.whenCustomersListReturnsOneCustomer();
    this.subscriptionsListMock.mockResolvedValue({
      data: [
        {
          id: 'sub_cancel_1',
          items: {
            data: [{ price: { product: 'prod_cancel_x' } }],
          },
        },
      ],
    });
  }

  whenSubscriptionsUpdateThrows() {
    this.subscriptionsUpdateMock.mockRejectedValue(new Error('update failed'));
  }

  whenGetUserSubscriptionFullChainSucceeds() {
    this.whenCustomersListReturnsOneCustomer();
    this.subscriptionsListMock.mockResolvedValue({
      data: [this.subscriptionRow],
    });
    this.whenProductsRetrieveSucceeds();
    this.paymentMethodsRetrieveMock.mockResolvedValue({
      card: { last4: '4242', brand: 'visa' },
    });
    this.whenCreatePreviewSucceeds();
  }

  whenCustomersListEmpty() {
    this.customersListMock.mockResolvedValue({ data: [] });
  }

  whenCustomersListReturnsOneCustomer() {
    this.customersListMock.mockResolvedValue({
      data: [{ id: this.customerId }],
    });
  }

  whenSubscriptionsListEmpty() {
    this.subscriptionsListMock.mockResolvedValue({ data: [] });
  }

  whenSubscriptionWithoutPaymentMethod() {
    this.subscriptionsListMock.mockResolvedValue({
      data: [
        {
          ...this.subscriptionRow,
          default_payment_method: null,
        },
      ],
    });
  }

  whenProductsRetrieveSucceeds() {
    this.productsRetrieveMock.mockResolvedValue({
      name: this.expectedStripeSubscription.plan,
    });
  }

  whenCreatePreviewSucceeds() {
    this.invoicesCreatePreviewMock.mockResolvedValue({
      period_end: this.expectedStripeSubscription.currentPeriodEnd,
    });
  }

  whenGetUserSubscriptionUntilPreview() {
    this.whenCustomersListReturnsOneCustomer();
    this.subscriptionsListMock.mockResolvedValue({
      data: [this.subscriptionRow],
    });
    this.whenProductsRetrieveSucceeds();
    this.paymentMethodsRetrieveMock.mockResolvedValue({
      card: { last4: '4242', brand: 'visa' },
    });
  }

  whenCreatePreviewThrows() {
    this.invoicesCreatePreviewMock.mockRejectedValue(new Error('preview unavailable'));
  }

  whenCustomersListSucceeds() {
    this.customersListMock.mockResolvedValue({ data: this.customers });
  }

  whenCustomersListThrowsError() {
    this.customersListMock.mockRejectedValue(new Error('stripe customer failure'));
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
    this.checkoutSessionsListMock.mockRejectedValue(new Error('stripe session failure'));
  }

  whenSubscriptionsListSucceeds() {
    this.subscriptionsListMock.mockResolvedValue({ data: this.subscriptions });
  }

  whenSubscriptionsListThrowsError() {
    this.subscriptionsListMock.mockRejectedValue(new Error('stripe subscription failure'));
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
    this.checkoutSessionsRetrieveMock.mockRejectedValue(new Error('retrieve failure'));
  }

  whenCreateCheckoutSessionSucceeds() {
    this.checkoutSessionsCreateMock.mockResolvedValue({
      url: 'https://stripe.test/checkout',
    });
  }

  whenCreateCheckoutSessionThrowsError() {
    this.checkoutSessionsCreateMock.mockRejectedValue(new Error('create failure'));
  }

  async thenThrowServerErrorWithMessagePart(promise: Promise<unknown>, messagePart: string) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
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

  thenReturnExpectedCustomers(result: unknown) {
    expect(result).toEqual(this.customers);
  }

  thenReturnExpectedCustomerId(result: unknown) {
    expect(result).toEqual(this.customerId);
  }

  thenReturnExpectedSubscriptions(result: unknown) {
    expect(result).toEqual(this.subscriptions);
  }

  thenCheckoutSessionRetrieveCalledWithExpectedArguments() {
    expect(this.checkoutSessionsRetrieveMock).toHaveBeenCalledWith(this.checkoutSessionId);
    expect(this.checkoutSessionsRetrieveMock).toHaveBeenCalledTimes(1);
  }

  thenReturnMappedCheckoutSession(result: unknown) {
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
      allow_promotion_codes: true,
      locale: 'auto',
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

  thenReturnCheckoutUrl(result: unknown) {
    expect(result).toEqual({ url: 'https://stripe.test/checkout' });
  }

  thenCancelSubscriptionStripeCallsSucceeded() {
    expect(this.customersListMock).toHaveBeenCalledWith({
      email: this.cancelDomainUser.email,
      limit: 1,
    });
    expect(this.subscriptionsListMock).toHaveBeenCalledWith({
      customer: this.customerId,
      status: 'active',
      limit: 1,
    });
    expect(this.subscriptionsUpdateMock).toHaveBeenCalledWith('sub_cancel_1', {
      cancel_at_period_end: true,
    });
    expect(this.productsRetrieveMock).toHaveBeenCalledWith('prod_cancel_x');
  }

  thenSubscriptionsUpdateNotCalled() {
    expect(this.subscriptionsUpdateMock).not.toHaveBeenCalled();
  }

  thenBillingPortalSessionCreatedWithExpectedArguments() {
    expect(this.customersListMock).toHaveBeenCalledWith({
      email: this.email,
      limit: 1,
    });
    expect(this.billingPortalSessionsCreateMock).toHaveBeenCalledWith({
      customer: this.customerId,
      return_url: 'https://app.portal.test/profile',
    });
    expect(this.billingPortalSessionsCreateMock).toHaveBeenCalledTimes(1);
  }

  thenBillingPortalSessionCreateNotCalled() {
    expect(this.billingPortalSessionsCreateMock).not.toHaveBeenCalled();
  }

  thenReactivateSubscriptionStripeCallsSucceeded() {
    expect(this.customersListMock).toHaveBeenCalledWith({
      email: this.email,
      limit: 1,
    });
    expect(this.subscriptionsListMock).toHaveBeenCalledWith({
      customer: this.customerId,
      limit: 1,
    });
    expect(this.subscriptionsUpdateMock).toHaveBeenCalledWith('sub_reactivate_1', {
      cancel_at_period_end: false,
    });
  }
}
