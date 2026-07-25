import { Inject } from '@nestjs/common';
import { User } from 'src/domain/auth/types/auth.type';
import { type IStripeProvider, STRIPE_PROVIDER } from 'src/domain/billing/contracts/i-stripe-client.provider';

export class ReactivateSubscriptionUseCase {
  constructor(
    @Inject(STRIPE_PROVIDER)
    private readonly stripeRepository: IStripeProvider,
  ) {}

  async execute(user: User): Promise<void> {
    const email = user.email;
    await this.stripeRepository.reactivateSubscription(email);
  }
}
