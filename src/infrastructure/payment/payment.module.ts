import { Module } from "@nestjs/common";
import { PAYMENT_CLIENT } from "../../interfaces/payment.interface";
import { StripeRepository } from "./stripe.repository";
import { StripeModule } from "./stripe.module";

@Module({
    imports: [StripeModule],
    providers: [
        {
            provide: PAYMENT_CLIENT,
            useClass: StripeRepository,
        },
    ],
    exports: [PAYMENT_CLIENT],
})
export class PaymentModule {}
