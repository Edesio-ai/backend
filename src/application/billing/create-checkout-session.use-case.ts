import { Inject } from '@nestjs/common';
import { User } from '../../domain/auth/types/auth.type';
import { TokenUserNotFoundError } from '../../domain/auth/errors/auth.errors';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from 'src/domain/subscription/contracts/subscription.repository';
import {
  STRIPE_CLIENT_INTERFACE,
  type IStripeClientProvider,
} from '../../domain/billing/contracts/i-stripe-client.provider';

export class CreateCheckoutSessionsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_CLIENT_INTERFACE)
    private readonly paymentClient: IStripeClientProvider,
  ) {}

  async execute(priceId: string, planType: string, user: User): Promise<any> {
    if (!user) {
      throw new TokenUserNotFoundError('User not found');
    }

    const { id } = user;
    const subscription =
      await this.subscriptionRepository.getUserSubscription(id);

    if (!subscription) {
      return await this.paymentClient.createCheckoutSession(
        user,
        priceId,
        planType,
      );
    }

    return {
      checkoutUrl: subscription.checkout_url,
    };
  }
}
