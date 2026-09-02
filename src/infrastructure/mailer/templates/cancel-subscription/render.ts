import { DEFAULT_LOCALE } from 'src/domain/shared/locale.type';
import { CancelSubscriptionEmailParams } from 'src/domain/billing/types/billing.type';
import { getEmailLogoCid } from '../html';
import { renderCancelSubscriptionTemplate as renderEn } from './en/template';
import { renderCancelSubscriptionTemplate as renderFr } from './fr/template';

const TEMPLATES = {
  en: renderEn,
  fr: renderFr,
} as const;

export function renderCancelSubscriptionEmail(params: CancelSubscriptionEmailParams) {
  const locale = params.locale ?? DEFAULT_LOCALE;
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

  return TEMPLATES[locale]({
    logoUrl: getEmailLogoCid(),
    firstname: params.firstname,
    planName: params.planName,
    endDate: params.endDate,
    profileUrl: `${appUrl}/profile`,
    year: new Date().getFullYear(),
  });
}
