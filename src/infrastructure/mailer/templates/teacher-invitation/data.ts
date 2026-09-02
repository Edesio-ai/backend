import { DEFAULT_LOCALE, type Locale } from 'src/domain/shared/locale.type';
import { TeacherInvitationTemplateData } from './types';

export function buildTeacherInvitationTemplateData(params: {
  inviterName: string;
  invitationToken: string;
  availableChatbots: number;
  appUrl: string;
  logoUrl: string;
  locale?: Locale;
}): TeacherInvitationTemplateData {
  return {
    locale: params.locale ?? DEFAULT_LOCALE,
    inviterName: params.inviterName,
    signupUrl: `${params.appUrl}/register/teacher-invitation/${params.invitationToken}`,
    appUrl: params.appUrl,
    logoUrl: params.logoUrl,
    availableChatbots: params.availableChatbots,
  };
}
