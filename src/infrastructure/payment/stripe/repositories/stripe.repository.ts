import { Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from '../stripe.module';
import { type IStripeProvider } from 'src/domain/billing/contracts/i-stripe-client.provider';
import { User } from 'src/domain/auth/types/auth.type';
import {
  StripeSession,
  StripeSubscription,
  CancelSubscription,
} from 'src/domain/billing/types/billing.type';
import {
  NotFoundError,
  ServerError,
} from 'src/domain/shared/errors/global.errors';

export class StripeRepository implements IStripeProvider {
  constructor(
    @Inject(STRIPE_CLIENT)
    private readonly stripeClient: Stripe,
  ) {}
  async getCheckoutSession(sessionId: string): Promise<StripeSession> {
    try {
      const session =
        await this.stripeClient.checkout.sessions.retrieve(sessionId);
      return {
        id: session.id,
        customerId:
          typeof session.customer === 'string'
            ? session.customer
            : (session.customer?.id ?? null),
        subscriptionId:
          typeof session.subscription === 'string'
            ? session.subscription
            : (session.subscription?.id ?? null),
        status: session.status ?? 'open',
        paymentStatus: session.payment_status,
        metadata: session.metadata ?? {},
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error retrieving checkout session: ${message}`);
    }
  }

  async getCustomerByEmail(email: string): Promise<any> {
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

  async getCheckoutSessionByUserId(userId: string): Promise<any> {
    try {
      const sessions = await this.stripeClient.checkout.sessions.list({
        limit: 20,
      });

      const matchingSession = sessions.data.find(
        (s) => s.client_reference_id === userId && s.customer,
      );

      if (matchingSession && matchingSession.customer) {
        return typeof matchingSession.customer === 'string'
          ? matchingSession.customer
          : matchingSession.customer.id;
      }
      return null;
    } catch (sessionErr) {
      const message =
        sessionErr instanceof Error ? sessionErr.message : 'Unknown error';
      throw new ServerError(`Error searching checkout sessions: ${message}`);
    }
  }

  async getSubscriptionsByCustomerId(customerId: string): Promise<any> {
    try {
      const subscriptions = await this.stripeClient.subscriptions.list({
        customer: customerId,
        limit: 10,
      });

      return subscriptions.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error searching subscriptions: ${message}`);
    }
  }

  async createCheckoutSession(
    user: User,
    priceId: string,
    planType: string,
  ): Promise<any> {
    try {
      const { email } = user;

      const session = await this.stripeClient.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        allow_promotion_codes: true,
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
        status: 'all',
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

      let last4: string | null = null;
      let cardBrand: string | null = null;

      if (subscription.default_payment_method) {
        try {
          const paymentMethod = await this.stripeClient.paymentMethods.retrieve(
            subscription.default_payment_method as string,
          );
          if (paymentMethod.card) {
            last4 = paymentMethod.card.last4;
            cardBrand = paymentMethod.card.brand;
          }
        } catch (e) {
          console.error('Error fetching payment method:', e);
        }
      }

      const preview = await this.getPreview(customerId, subscription.id);

      return {
        id: subscription.id,
        status: subscription.status,
        plan: productName,
        interval: interval,
        amount: subscription.items.data[0]?.price?.unit_amount || 0,
        currency: subscription.items.data[0]?.price?.currency || 'eur',
        currentPeriodEnd: preview ? preview.period_end : subscription.cancel_at,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        last4,
        cardBrand,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ServerError(`Error searching subscriptions: ${message}`);
    }
  }

  private async getPreview(
    customerId: string,
    subscriptionId: string,
  ): Promise<any> {
    try {
      const preview = await this.stripeClient.invoices.createPreview({
        customer: customerId,
        subscription: subscriptionId,
      });
      return preview;
    } catch (error) {
      return null;
    }
  }

  public async cancelSubscription(user: User): Promise<CancelSubscription> {
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

      const canceledSubscription = await this.stripeClient.subscriptions.update(
        subscriptionId,
        { cancel_at_period_end: true },
      );

      const productId = subscriptions.data[0].items.data[0]?.price
        ?.product as string;

      let planName = 'Abonnement Edesio';
      if (productId) {
        try {
          const product = await this.stripeClient.products.retrieve(productId);
          planName = product.name;
        } catch (e) {
          console.error('Error fetching product for email:', e);
        }
      }

      const endTimestamp = (canceledSubscription as any).cancel_at;
      const endDate = new Date(endTimestamp * 1000).toLocaleDateString(
        'fr-FR',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
      );

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
}
