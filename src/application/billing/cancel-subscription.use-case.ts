import { Inject } from '@nestjs/common';
import { User } from 'src/domain/auth/types/auth.type';
import { type IStripeProvider, STRIPE_PROVIDER } from 'src/domain/billing/contracts/i-stripe-client.provider';
import { EMAIL_PROVIDER, type IEmailProvider } from 'src/domain/email/contract/i-email.interface';
import { CancelSubscription } from 'src/domain/billing/types/billing.type';
import { normalizeLocale, type Locale } from 'src/domain/shared/locale.type';

export class CancelSubscriptionUseCase {
  constructor(
    @Inject(STRIPE_PROVIDER)
    private readonly stripeRepository: IStripeProvider,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
  ) {}

  async execute(user: User, locale?: Locale): Promise<CancelSubscription> {
    const normalizedLocale = normalizeLocale(locale);
    const canceledSubscription = await this.stripeRepository.cancelSubscription(user, normalizedLocale);

    await this.emailProvider.sendCancelSubscriptionEmail({
      email: user.email,
      firstname: user.metadata.firstname ?? '',
      planName: canceledSubscription.planName,
      endDate: canceledSubscription.endDate,
      locale: normalizedLocale,
    });

    return canceledSubscription;
  }
}
