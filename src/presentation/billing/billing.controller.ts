import { Body, Controller, Get, Post } from '@nestjs/common';

import { GetSubscriptionStatusUseCase } from '../../application/billing/get-subscription-status.use-case';
import type { User } from '../../domain/auth/types/auth.type';
import { CreateCheckoutSessionsUseCase } from '../../application/billing/create-checkout-session.use-case';
import { CreateCheckoutSessionBodyDto } from './dtos/createCheckoutSession.dto';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase,
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionsUseCase,
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
}
