export const LOCALES = ['en', 'fr'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';

export function normalizeLocale(locale?: string | null): Locale {
  return locale === 'en' ? 'en' : DEFAULT_LOCALE;
}
