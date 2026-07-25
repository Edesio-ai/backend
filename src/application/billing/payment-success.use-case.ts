import { Inject, Injectable } from '@nestjs/common';
import { StripeSession } from '../../domain/billing/types/billing.type';
import { STRIPE_PROVIDER, type IStripeProvider } from '../../domain/billing/contracts/i-stripe-client.provider';

@Injectable()
export class PaymentSuccessUseCase {
  constructor(
    @Inject(STRIPE_PROVIDER)
    private readonly paymentClient: IStripeProvider,
  ) {}

  async execute(sessionId: string): Promise<StripeSession> {
    const session = await this.paymentClient.getCheckoutSession(sessionId);
    return session;
  }
}
