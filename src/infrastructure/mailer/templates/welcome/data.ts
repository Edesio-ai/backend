import { DEFAULT_LOCALE, type Locale } from 'src/domain/shared/locale.type';
import * as enRoles from './en/roles';
import * as frRoles from './fr/roles';
import { WelcomeEmailRole, WelcomeEmailTemplateData } from './types';

const DASHBOARD_PATHS: Record<WelcomeEmailRole, string> = {
  teacher: '/teacher',
  student: '/student',
  establishment: '/establishment',
  'self-learner': '/self-learner',
};

const ROLE_ALIASES: Record<string, WelcomeEmailRole> = {
  teacher: 'teacher',
  student: 'student',
  establishment: 'establishment',
  'self-learner': 'self-learner',
};

const ROLES = {
  en: enRoles,
  fr: frRoles,
} as const;

export function buildWelcomeEmailTemplateData(params: {
  role: string;
  name: string;
  appUrl: string;
  logoUrl: string;
  locale?: Locale;
}): WelcomeEmailTemplateData {
  const locale = params.locale ?? DEFAULT_LOCALE;
  const normalizedRole = normalizeRole(params.role);
  const roles = ROLES[locale];

  return {
    locale,
    name: params.name,
    roleLabel: roles.roleLabels[normalizedRole],
    dashboardPath: DASHBOARD_PATHS[normalizedRole],
    quickStartItems: roles.quickStartItems[normalizedRole],
    appUrl: params.appUrl,
    logoUrl: params.logoUrl,
  };
}

function normalizeRole(role: string): WelcomeEmailRole {
  const key = role.toLowerCase().trim();
  return ROLE_ALIASES[key] ?? 'student';
}
