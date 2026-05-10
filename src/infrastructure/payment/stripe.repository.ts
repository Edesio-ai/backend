import { Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { IStripeClientProvider } from '../../domain/billing/contracts/i-stripe-client.provider';
import { STRIPE_CLIENT } from './stripe.module';
import { User } from 'src/domain/auth/types/auth.type';
import { StripeSession } from 'src/domain/billing/types/billing.type';
import { ServerError } from 'src/domain/shared/errors/global.errors';

export class StripeRepository implements IStripeClientProvider {
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
}
