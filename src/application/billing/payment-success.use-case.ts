import { Inject, Injectable } from '@nestjs/common';
import { StripeSession } from '../../domain/billing/types/billing.type';
import {
  STRIPE_CLIENT_INTERFACE,
  type IStripeClientProvider,
} from '../../domain/billing/contracts/i-stripe-client.provider';

@Injectable()
export class PaymentSuccessUseCase {
  constructor(
    @Inject(STRIPE_CLIENT_INTERFACE)
    private readonly paymentClient: IStripeClientProvider,
  ) {}

  async execute(sessionId: string): Promise<StripeSession> {
    const session = await this.paymentClient.getCheckoutSession(sessionId);
    return session;
  }
}
