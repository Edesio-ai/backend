import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { GetSubscriptionStatusUseCase } from '../../application/billing/get-subscription-status.use-case';
import { User } from '../../domain/auth/types/auth.type';
import { CreateCheckoutSessionsUseCase } from '../../application/billing/create-checkout-session.use-case';
import { CreateCheckoutSessionBodyDto } from './dtos/createCheckoutSession.dto';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase,
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionsUseCase,
  ) {}

  @Get('subscription-status')
  async getSubscriptionStatus(
    @Req() req: Request & { user: User },
  ): Promise<any> {
    const { user } = req;
    return this.getSubscriptionStatusUseCase.execute(user);
  }

  @Post('checkout-session')
  async createCheckoutSession(
    @Req() req: Request & { user: User },
    @Body() body: CreateCheckoutSessionBodyDto,
  ): Promise<any> {
    const { priceId, planType } = body;
    return await this.createCheckoutSessionUseCase.execute(
      priceId,
      planType,
      req.user,
    );
  }
}
