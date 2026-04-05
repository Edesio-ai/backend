import { Inject, Injectable } from "@nestjs/common";
import { User } from "../../domain/auth/auth.type";
import { PAYMENT_CLIENT, type PaymentClientInterface } from "../../interfaces/payment.interface";

@Injectable()
export class GetSubscriptionStatusUseCase {
    $
    constructor(
        @Inject(PAYMENT_CLIENT)
        private readonly paymentClient: PaymentClientInterface,
    ) { }

    async execute(user: User): Promise<any> {
        const { email, id } = user;
        const { role } = user.user_metadata;

        if (role === "student") {
            return {
                hasActiveSubscription: true,
                role
            }
        }

        if (!email) {
            console.error(`Subscription check: no email for user ${id}, role=${role}`);
            return { hasActiveSubscription: false, role };
        }

        const customers = await this.paymentClient.getCustomerByEmail(email);

        const customerId: string | null = customers.length > 0 ? customers[0].id : await this.paymentClient.getCheckoutSessionByUserId(id);

        if (!customerId) {
            return {
                hasActiveSubscription: false,
                role
            };
        }

        const subscriptions = await this.paymentClient.getSubscriptionsByCustomerId(customerId);
        const subscription = this.getSubscriptionStatus(subscriptions);

        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const isPending = subscription.status === "past_due" || subscription.status === "incomplete";
        const isWithinPeriod = subscription.cancel_at_period_end &&
            (subscription as any).current_period_end * 1000 > Date.now();

        return {
            hasActiveSubscription: isActive || isWithinPeriod,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: (subscription as any).current_period_end,
            isPending,
            role,
        };
    }

    private getSubscriptionStatus(subscriptions: any): any {
        let subscription = subscriptions.find(
            sub => sub.status === "active" || sub.status === "trialing"
        );

        if (!subscription) {
            subscription = subscriptions.data.find(sub => {
                const isWithinPeriod = sub.cancel_at_period_end &&
                    (sub as any).current_period_end * 1000 > Date.now();
                return isWithinPeriod;
            });
        }

        if (!subscription) {
            subscription = subscriptions.data.find(
                sub => sub.status === "past_due" || sub.status === "incomplete"
            );
        }

        if (!subscription) {
            subscription = subscriptions.data[0];
        }

        return subscription;
    }
}