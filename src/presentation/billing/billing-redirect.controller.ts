import { Controller, Get, Query, Res } from '@nestjs/common';
import { type Response } from 'express';
import { PaymentSuccessUseCase } from '../../application/billing/payment-success.use-case';
import { Public } from '../auth/decorator/public.decorator';
import { SkipCsrf } from '../auth/decorator/skip-csrf.decorator';

const POST_PAYMENT_PATH: Record<string, string> = {
  teacher: '/teacher/sessions',
  establishment: '/establishment/overview',
};

@Public()
@SkipCsrf()
@Controller('billing/redirect')
export class BillingRedirectController {
  constructor(private readonly paymentSuccessUseCase: PaymentSuccessUseCase) {}

  @Get('success')
  async success(@Query('session_id') sessionId: string, @Res() res: Response) {
    const session = await this.paymentSuccessUseCase.execute(sessionId);
    if (!session) {
      return res.redirect(302, `${process.env.FRONTEND_URL}/billing/error/reason=no-sub`);
    }
    const { metadata } = session;
    const { plan } = metadata;
    const path = POST_PAYMENT_PATH[plan] ?? `/${plan}`;
    return res.redirect(302, `${process.env.FRONTEND_URL}${path}`);
  }

  @Get('cancel')
  cancel(@Res() res: Response) {
    return res.redirect(302, `${process.env.FRONTEND_URL}/billing/choose-plan`);
  }
}
