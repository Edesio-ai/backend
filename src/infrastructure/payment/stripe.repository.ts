import { Inject } from "@nestjs/common";
import Stripe from "stripe";
import { PaymentClientInterface } from "../../interfaces/payment.interface";
import { STRIPE_CLIENT } from "./stripe.module";
import { StripeError } from "../../domain/billing/error";

export class StripeRepository implements PaymentClientInterface {
    constructor(
        @Inject(STRIPE_CLIENT)
        private readonly stripeClient: Stripe,
    ) { }

    async getCustomerByEmail(email: string): Promise<any> {
        try {
            const customer = await this.stripeClient.customers.list({
                email: email,
                limit: 1,
            });

            return customer.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new StripeError(`Error searching customers: ${message}`);
        }
    }

    async getCheckoutSessionByUserId(userId: string): Promise<any> {
        try {
            const sessions = await this.stripeClient.checkout.sessions.list({
                limit: 20,
            });

            const matchingSession = sessions.data.find(
                s => s.client_reference_id === userId && s.customer
            );

            if (matchingSession && matchingSession.customer) {
                return typeof matchingSession.customer === "string"
                    ? matchingSession.customer
                    : matchingSession.customer.id;
            }
            return null;
        } catch (sessionErr) {
            const message = sessionErr instanceof Error ? sessionErr.message : "Unknown error";
            throw new StripeError(`Error searching checkout sessions: ${message}`);
        }
    }

    async getSubscriptionsByCustomerId(customerId: string): Promise<any> {
        try {
            const subscriptions = await this.stripeClient.subscriptions.list({
                customer: customerId,
                limit: 10,
              });

            return subscriptions.data;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new StripeError(`Error searching subscriptions: ${message}`);
        }
    }
}