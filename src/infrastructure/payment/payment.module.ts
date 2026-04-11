import { Module } from '@nestjs/common';
import { STRIPE_CLIENT_INTERFACE } from '../../domain/billing/contracts/stripe-client.interface';
import { StripeRepository } from './stripe.repository';
import { StripeModule } from './stripe.module';

@Module({
  imports: [StripeModule],
  providers: [
    {
      provide: STRIPE_CLIENT_INTERFACE,
      useClass: StripeRepository,
    },
  ],
  exports: [STRIPE_CLIENT_INTERFACE],
})
export class PaymentModule {}
