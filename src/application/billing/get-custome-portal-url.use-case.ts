import { Inject } from '@nestjs/common';
import { type IStripeProvider, STRIPE_PROVIDER } from 'src/domain/billing/contracts/i-stripe-client.provider';
import { User } from 'src/domain/auth/types/auth.type';

export class GetCustomerPortalUrlUseCase {
  constructor(
    @Inject(STRIPE_PROVIDER)
    private readonly stripeRepository: IStripeProvider,
  ) {}

  async execute(user: User): Promise<string | null> {
    return this.stripeRepository.getCustomerPortalUrl(user.email);
  }
}
