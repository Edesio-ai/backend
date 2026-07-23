import { Inject } from '@nestjs/common';
import { User } from '../../domain/auth/types/auth.type';
import { TokenUserNotFoundError } from '../../domain/auth/errors/auth.errors';
import {
  SUBSCRIPTION_REPOSITORY,
  type ISubscriptionRepository,
} from 'src/domain/subscription/contracts/i-subscription.repository';
import {
  STRIPE_PROVIDER,
  type IStripeProvider,
} from '../../domain/billing/contracts/i-stripe-client.provider';

export class CreateCheckoutSessionsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(STRIPE_PROVIDER)
    private readonly paymentClient: IStripeProvider,
  ) {}

  async execute(
    priceId: string,
    planType: string,
    user: User,
    locale?: 'en' | 'fr',
  ): Promise<any> {
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
        locale,
      );
    }

    return {
      checkoutUrl: subscription.checkout_url,
    };
  }
}
