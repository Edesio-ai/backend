import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { GetSubscriptionStatusUseCase } from "../../application/billing/get-subscription-status.use-case";
import { authPersistenceModule } from "../../infrastructure/persistence/supabase/auth/auth-persistence.module";
import { PaymentModule } from "../../infrastructure/payment/payment.module";

@Module({
    imports: [
        PaymentModule,
        authPersistenceModule
    ],
    controllers: [BillingController],
    providers: [
        GetSubscriptionStatusUseCase,
    ]
})
export class BillingModule {}