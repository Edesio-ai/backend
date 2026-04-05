import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { GetSubscriptionStatusUseCase } from "../../application/billing/get-subscription-status.use-case";
import { authPersistenceModule } from "../../infrastructure/persistence/supabase/auth/auth-persistence.module";
import { PaymentModule } from "../../infrastructure/payment/payment.module";
import { CreateCheckoutSessionsUseCase } from "../../application/billing/create-checkout-session.use-case";
import { SubscriptionPersistenceModule } from "../../infrastructure/persistence/supabase/subscription/student-persistence.module";
import { BillingRedirectController } from "./billing-redirect.controller";
import { PaymentSuccessUseCase } from "../../application/billing/payment-success.use-case";

@Module({
    imports: [
        PaymentModule,
        authPersistenceModule,
        SubscriptionPersistenceModule
    ],
    controllers: [BillingController, BillingRedirectController],
    providers: [
        GetSubscriptionStatusUseCase,
        CreateCheckoutSessionsUseCase,
        PaymentSuccessUseCase,
    ]
})
export class BillingModule {}