import { Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from '../stripe.module';
import { type IStripeProvider } from 'src/domain/billing/contracts/i-stripe-client.provider';
import { User } from 'src/domain/auth/types/auth.type';
import {
  StripeSession,
  StripeSubscription,
  CancelSubscription,
  StripeCustomer,
  StripeSubscriptionsLookup,
  CheckoutSessionCreateResult,
} from 'src/domain/billing/types/billing.type';
import { NotFoundError, ServerError } from 'src/domain/shared/errors/global.errors';
import { DEFAULT_LOCALE, type Locale } from 'src/domain/shared/locale.type';

export class StripeRepository implements IStripeProvider {
  constructor(
    @Inject(STRIPE_CLIENT)
    private readonly stripeClient: Stripe,
  ) {}
  async getCheckoutSession(sessionId: string): Promise<StripeSession> {
    try {
      const session = await this.stripeClient.checkout.sessions.retrieve(sessionId);
      return {
        id: session.id,
        customerId: typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null),
        subscriptionId:
          typeof session.subscription === 'string' ? session.subscription : (session.subscription?.id ?? null),
        status: session.status ?? 'open',
        paymentStatus: session.payment_status,
        metadata: session.metadata ?? {},
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error retrieving checkout session: ${message}`);
    }
  }

  async getCustomerByEmail(email: string): Promise<StripeCustomer[]> {
    try {
      const customer = await this.stripeClient.customers.list({
        email: email,
        limit: 1,
      });

      return customer.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error searching customers: ${message}`);
    }
  }

  async getCheckoutSessionByUserId(userId: string): Promise<string | null> {
    try {
      const sessions = await this.stripeClient.checkout.sessions.list({
        limit: 20,
      });

      const matchingSession = sessions.data.find((s) => s.client_reference_id === userId && s.customer);

      if (matchingSession && matchingSession.customer) {
        return typeof matchingSession.customer === 'string' ? matchingSession.customer : matchingSession.customer.id;
      }
      return null;
    } catch (sessionErr) {
      const message = sessionErr instanceof Error ? sessionErr.message : 'Unknown error';
      throw new ServerError(`Error searching checkout sessions: ${message}`);
    }
  }

  async getSubscriptionsByCustomerId(customerId: string): Promise<StripeSubscriptionsLookup> {
    try {
      const subscriptions = await this.stripeClient.subscriptions.list({
        customer: customerId,
        limit: 10,
      });

      // Runtime shape is a plain array; callers may also read `.data` (tests attach it).
      return subscriptions.data as unknown as StripeSubscriptionsLookup;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error searching subscriptions: ${message}`);
    }
  }

  async createCheckoutSession(
    user: User,
    priceId: string,
    planType: string,
    locale?: Locale,
  ): Promise<CheckoutSessionCreateResult> {
    try {
      const { email } = user;

      const session = await this.stripeClient.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        allow_promotion_codes: true,
        locale: locale ?? 'auto',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          plan: planType,
        },
        subscription_data: {
          metadata: {
            plan: planType,
            priceId: priceId,
          },
        },
        success_url: `${process.env.STRIPE_REDIRECT_URI}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.STRIPE_REDIRECT_URI}/cancel?session_id={CHECKOUT_SESSION_ID}`,
      });
      return { url: session.url! };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      throw new ServerError(`Error creating checkout session: ${message}`);
    }
  }

  async getUserSubscription(email: string): Promise<StripeSubscription | null> {
    try {
      const customers = await this.getCustomerByEmail(email);

      if (customers.length === 0) {
        return null;
      }

      const customerId = customers[0].id;
      const subscriptions = await this.stripeClient.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return null;
      }

      const subscription = subscriptions.data[0];
      const productId = subscription.items.data[0]?.price?.product as string;

      let productName = 'Abonnement';
      let interval = 'month';

      if (productId) {
        try {
          const product = await this.stripeClient.products.retrieve(productId);
          productName = product.name;
        } catch (e) {
          console.error('Error fetching product:', e);
        }
      }

      if (subscription.items.data[0]?.price?.recurring?.interval) {
        interval = subscription.items.data[0].price.recurring.interval;
      }

      const { last4, cardBrand } = await this.resolveCardDetails(customerId, subscription);
      const preview = await this.getPreview(customerId, subscription.id);

      return {
        id: subscription.id,
        status: subscription.status,
        plan: productName,
        interval: interval,
        amount: subscription.items.data[0]?.price?.unit_amount || 0,
        currency: subscription.items.data[0]?.price?.currency || 'eur',
        currentPeriodEnd: (preview ? preview.period_end : subscription.cancel_at) ?? undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        last4,
        cardBrand,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error searching subscriptions: ${message}`);
    }
  }

  private async resolveCardDetails(
    customerId: string,
    subscription: Stripe.Subscription,
  ): Promise<{ last4: string | null; cardBrand: string | null }> {
    const fromSubscription = await this.getCardByPaymentMethodId(
      this.paymentMethodId(subscription.default_payment_method),
    );
    if (fromSubscription.last4) {
      return fromSubscription;
    }

    const customer = await this.stripeClient.customers.retrieve(customerId);
    if (!customer.deleted) {
      const fromCustomer = await this.getCardByPaymentMethodId(
        this.paymentMethodId(customer.invoice_settings?.default_payment_method),
      );
      if (fromCustomer.last4) {
        return fromCustomer;
      }
    }

    const listed = await this.stripeClient.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    });
    return this.cardFromPaymentMethod(listed.data[0]);
  }

  private paymentMethodId(value: string | Stripe.PaymentMethod | null | undefined): string | null {
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
    if (value && typeof value === 'object' && typeof value.id === 'string') {
      return value.id;
    }
    return null;
  }

  private async getCardByPaymentMethodId(
    paymentMethodId: string | null,
  ): Promise<{ last4: string | null; cardBrand: string | null }> {
    if (!paymentMethodId) {
      return { last4: null, cardBrand: null };
    }

    try {
      const paymentMethod = await this.stripeClient.paymentMethods.retrieve(paymentMethodId);
      return this.cardFromPaymentMethod(paymentMethod);
    } catch (error) {
      console.error('Error fetching payment method:', error);
      return { last4: null, cardBrand: null };
    }
  }

  private cardFromPaymentMethod(paymentMethod: Stripe.PaymentMethod | undefined): {
    last4: string | null;
    cardBrand: string | null;
  } {
    const card = paymentMethod?.card;
    if (!card?.last4) {
      return { last4: null, cardBrand: null };
    }
    return { last4: card.last4, cardBrand: card.brand ?? null };
  }

  private async getPreview(customerId: string, subscriptionId: string): Promise<Stripe.Invoice | null> {
    try {
      const preview = await this.stripeClient.invoices.createPreview({
        customer: customerId,
        subscription: subscriptionId,
      });
      return preview;
    } catch {
      return null;
    }
  }

  public async cancelSubscription(user: User, locale: Locale = DEFAULT_LOCALE): Promise<CancelSubscription> {
    try {
      const customer = await this.getCustomerByEmail(user.email);
      if (customer.length === 0) {
        throw new NotFoundError('Customer not found');
      }
      const customerId = customer[0].id;

      const subscriptions = await this.stripeClient.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        throw new NotFoundError('No active subscription found');
      }

      const subscriptionId = subscriptions.data[0].id;

      const canceledSubscription = await this.stripeClient.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      const productId = subscriptions.data[0].items.data[0]?.price?.product as string;

      let planName = 'Abonnement Edesio';
      if (productId) {
        try {
          const product = await this.stripeClient.products.retrieve(productId);
          planName = product.name;
        } catch (e) {
          console.error('Error fetching product for email:', e);
        }
      }

      const endTimestamp = canceledSubscription.cancel_at ?? 0;
      const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR';
      const endDate = new Date(endTimestamp * 1000).toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      return {
        planName,
        endDate,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error canceling subscription: ${message}`);
    }
  }

  async reactivateSubscription(email: string): Promise<void> {
    try {
      const customer = await this.getCustomerByEmail(email);
      if (customer.length === 0) {
        throw new NotFoundError('Customer not found');
      }
      const customerId = customer[0].id;

      const subscriptions = await this.stripeClient.subscriptions.list({
        customer: customerId,
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        throw new NotFoundError('No active subscription found');
      }

      const subscriptionId = subscriptions.data[0].id;

      await this.stripeClient.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error reactivating subscription: ${message}`);
    }
  }

  public async getCustomerPortalUrl(email: string): Promise<string | null> {
    try {
      const customer = await this.getCustomerByEmail(email);
      if (customer.length === 0) {
        throw new NotFoundError('Customer not found');
      }
      const customerId = customer[0].id;

      const portalUrl = await this.stripeClient.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.FRONTEND_URL}/profile`,
      });
      return portalUrl.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error getting customer portal url: ${message}`);
    }
  }
}
