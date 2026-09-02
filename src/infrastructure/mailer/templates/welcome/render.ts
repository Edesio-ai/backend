import { escapeHtml } from '../html';
import { renderWelcomeTemplate as renderEn } from './en/template';
import { renderWelcomeTemplate as renderFr } from './fr/template';
import { WelcomeEmailTemplateData } from './types';

const TEMPLATES = {
  en: renderEn,
  fr: renderFr,
} as const;

export function renderWelcomeEmail(data: WelcomeEmailTemplateData) {
  return TEMPLATES[data.locale]({
    logoUrl: data.logoUrl,
    name: data.name,
    roleLabel: data.roleLabel,
    dashboardUrl: `${data.appUrl}${data.dashboardPath}`,
    appUrl: data.appUrl,
    quickStartItemsHtml: data.quickStartItems
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('\n                      '),
  });
}
