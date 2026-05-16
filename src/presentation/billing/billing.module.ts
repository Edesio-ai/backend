import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { GetSubscriptionStatusUseCase } from '../../application/billing/get-subscription-status.use-case';
import { AuthPersistenceModule } from '../../infrastructure/supabase/auth/auth-persistence.module';
import { PaymentModule } from '../../infrastructure/payment/payment.module';
import { CreateCheckoutSessionsUseCase } from '../../application/billing/create-checkout-session.use-case';
import { SubscriptionPersistenceModule } from '../../infrastructure/supabase/subscription/student-persistence.module';
import { BillingRedirectController } from './billing-redirect.controller';
import { PaymentSuccessUseCase } from '../../application/billing/payment-success.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/establishment/establishment-persistence.module';
import { GetSubscriptionUseCase } from 'src/application/billing/get-subscription.use-case';
import { CancelSubscriptionUseCase } from 'src/application/billing/cancel-subscription.use-case';
import { MailerModule } from 'src/infrastructure/mailer/mailer.module';

@Module({
  imports: [
    PaymentModule,
    AuthPersistenceModule,
    SubscriptionPersistenceModule,
    TeacherPersistenceModule,
    EstablishmentPersistenceModule,
    MailerModule,
  ],
  controllers: [BillingController, BillingRedirectController],
  providers: [
    GetSubscriptionStatusUseCase,
    CreateCheckoutSessionsUseCase,
    PaymentSuccessUseCase,
    GetSubscriptionUseCase,
    CancelSubscriptionUseCase,
  ],
})
export class BillingModule {}
