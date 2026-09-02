import { Locale } from 'src/domain/shared/locale.type';

export type TeacherInvitationTemplateData = {
  locale: Locale;
  inviterName: string;
  signupUrl: string;
  appUrl: string;
  logoUrl: string;
  availableChatbots: number;
};

export type TeacherInvitationView = {
  logoUrl: string;
  inviterName: string;
  signupUrl: string;
  availableChatbots: number;
};
