import { Inject, Injectable } from "@nestjs/common";
import { StripeSession } from "../../domain/billing/billing.type";
import { PAYMENT_CLIENT, type PaymentClientInterface } from "../../interfaces/payment.interface";

@Injectable()
export class PaymentSuccessUseCase {
    constructor(
        @Inject(PAYMENT_CLIENT)
        private readonly paymentClient: PaymentClientInterface,
    ) { }

    async execute(sessionId: string): Promise<StripeSession> {
        const session = await this.paymentClient.getCheckoutSession(sessionId);
        return session;
    }
}