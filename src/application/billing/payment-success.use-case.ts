import { Inject, Injectable } from '@nestjs/common';
import { StripeSession } from '../../domain/billing/billing.type';
import {
  STRIPE_CLIENT_INTERFACE,
  type StripeClientInterface,
} from '../../domain/billing/contracts/stripe-client.interface';

@Injectable()
export class PaymentSuccessUseCase {
  constructor(
    @Inject(STRIPE_CLIENT_INTERFACE)
    private readonly paymentClient: StripeClientInterface,
  ) {}

  async execute(sessionId: string): Promise<StripeSession> {
    const session = await this.paymentClient.getCheckoutSession(sessionId);
    return session;
  }
}
