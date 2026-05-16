import { Body, Controller, Get, Post } from '@nestjs/common';

import { GetSubscriptionStatusUseCase } from '../../application/billing/get-subscription-status.use-case';
import type { User } from '../../domain/auth/types/auth.type';
import { CreateCheckoutSessionsUseCase } from '../../application/billing/create-checkout-session.use-case';
import { CreateCheckoutSessionBodyDto } from './dtos/createCheckoutSession.dto';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { GetSubscriptionUseCase } from 'src/application/billing/get-subscription.use-case';
import {
  CancelSubscription,
  StripeSubscription,
} from 'src/domain/billing/types/billing.type';
import { CancelSubscriptionUseCase } from 'src/application/billing/cancel-subscription.use-case';
import { ReactivateSubscriptionUseCase } from 'src/application/billing/reactivate-subscription.use-case';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase,
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionsUseCase,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    private readonly reactivateSubscriptionUseCase: ReactivateSubscriptionUseCase,
  ) {}

  @Get('subscription-status')
  async getSubscriptionStatus(@CurrentUser() user: User): Promise<any> {
    return this.getSubscriptionStatusUseCase.execute(user);
  }

  @Post('checkout-session')
  async createCheckoutSession(
    @CurrentUser() user: User,
    @Body() body: CreateCheckoutSessionBodyDto,
  ): Promise<any> {
    const { priceId, planType } = body;
    return await this.createCheckoutSessionUseCase.execute(
      priceId,
      planType,
      user,
    );
  }

  @Get('subscription')
  async getSubscription(
    @CurrentUser() user: User,
  ): Promise<{ subscription: StripeSubscription | null }> {
    const subscription = await this.getSubscriptionUseCase.execute(user);
    return { subscription };
  }

  @Post('subscription/cancel')
  async cancelSubscription(
    @CurrentUser() user: User,
  ): Promise<CancelSubscription> {
    return this.cancelSubscriptionUseCase.execute(user);
  }

  @Post('subscription/reactivate')
  async reactivateSubscription(@CurrentUser() user: User): Promise<void> {
    await this.reactivateSubscriptionUseCase.execute(user);
  }
}
