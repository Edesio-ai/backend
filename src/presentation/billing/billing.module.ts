import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { GetSubscriptionStatusUseCase } from '../../application/billing/get-subscription-status.use-case';
import { AuthPersistenceModule } from '../../infrastructure/supabase/auth/auth-persistence.module';
import { PaymentModule } from '../../infrastructure/payment/payment.module';
import { CreateCheckoutSessionsUseCase } from '../../application/billing/create-checkout-session.use-case';
import { SubscriptionPersistenceModule } from '../../infrastructure/supabase/subscription/student-persistence.module';
import { BillingRedirectController } from './billing-redirect.controller';
import { PaymentSuccessUseCase } from '../../application/billing/payment-success.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';

@Module({
  imports: [
    PaymentModule,
    AuthPersistenceModule,
    SubscriptionPersistenceModule,
    TeacherPersistenceModule,
    EstablishmentPersistenceModule,
  ],
  controllers: [BillingController, BillingRedirectController],
  providers: [
    GetSubscriptionStatusUseCase,
    CreateCheckoutSessionsUseCase,
    PaymentSuccessUseCase,
  ],
})
export class BillingModule {}
