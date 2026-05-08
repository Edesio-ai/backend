import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GetSubscriptionStatusUseCase } from '../../application/billing/get-subscription-status.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../domain/auth/types/auth.type';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { CreateCheckoutSessionsUseCase } from '../../application/billing/create-checkout-session.use-case';
import { AuthErrorFilter } from '../filters/auth.filter';
import { GlobalErrorFilter } from '../filters/global';
import { CreateCheckoutSessionBodyDto } from './dtos/createCheckoutSession.dto';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase,
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionsUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseFilters(GlobalErrorFilter)
  @Get('subscription-status')
  async getSubscriptionStatus(
    @Req() req: Request & { user: User },
  ): Promise<any> {
    const { user } = req;
    return this.getSubscriptionStatusUseCase.execute(user);
  }

  @UseGuards(JwtAuthGuard, CsrfGuard)
  @UseFilters(GlobalErrorFilter, AuthErrorFilter)
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
