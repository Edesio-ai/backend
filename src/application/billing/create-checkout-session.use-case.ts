import { Inject } from '@nestjs/common';
import { User } from '../../domain/auth/auth.type';
import { TokenUserNotFoundError } from '../../domain/auth/errors';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from '../../interfaces/persistence/subscription.repository';
import {
  PAYMENT_CLIENT,
  type PaymentClientInterface,
} from '../../interfaces/payment.interface';

export class CreateCheckoutSessionsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(PAYMENT_CLIENT)
    private readonly paymentClient: PaymentClientInterface,
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
