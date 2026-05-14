import { Inject } from '@nestjs/common';
import { User } from 'src/domain/auth/types/auth.type';
import {
  STRIPE_PROVIDER,
  type IStripeProvider,
} from 'src/domain/billing/contracts/i-stripe-client.provider';
import { StripeSubscription } from 'src/domain/billing/types/billing.type';

export class GetSubscriptionUseCase {
  constructor(
    @Inject(STRIPE_PROVIDER)
    private readonly stripeRepository: IStripeProvider,
  ) {}

  async execute(user: User): Promise<StripeSubscription | null> {
    const { email } = user;
    const subscriptions =
      await this.stripeRepository.getUserSubscription(email);
    return subscriptions;
  }
}
