import { Locale } from 'src/domain/shared/locale.type';

export type WelcomeEmailRole = 'teacher' | 'student' | 'establishment' | 'self-learner';

export type WelcomeEmailTemplateData = {
  locale: Locale;
  name: string;
  roleLabel: string;
  dashboardPath: string;
  quickStartItems: string[];
  appUrl: string;
  logoUrl: string;
};

export type WelcomeEmailView = {
  logoUrl: string;
  name: string;
  roleLabel: string;
  dashboardUrl: string;
  appUrl: string;
  quickStartItemsHtml: string;
};
