import { Inject } from '@nestjs/common';
import { User } from '../../domain/auth/auth.type';
import { TokenUserNotFoundError } from '../../domain/auth/errors';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from '../../domain/teaching/interface/subscription.repository';
import {
  STRIPE_CLIENT_INTERFACE,
  type StripeClientInterface,
} from '../../domain/billing/contracts/stripe-client.interface';

export class CreateCheckoutSessionsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_CLIENT_INTERFACE)
    private readonly paymentClient: StripeClientInterface,
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
