import { Module } from '@nestjs/common';
import { StripeRepository } from './stripe/repositories/stripe.repository';
import { StripeModule } from './stripe/stripe.module';
import { STRIPE_PROVIDER } from 'src/domain/billing/contracts/i-stripe-client.provider';

@Module({
  imports: [StripeModule],
  providers: [
    {
      provide: STRIPE_PROVIDER,
      useClass: StripeRepository,
    },
  ],
  exports: [STRIPE_PROVIDER],
})
export class PaymentModule {}
