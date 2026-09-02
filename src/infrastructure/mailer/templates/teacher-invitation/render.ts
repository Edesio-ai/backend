import { renderTeacherInvitationTemplate as renderEn } from './en/template';
import { renderTeacherInvitationTemplate as renderFr } from './fr/template';
import { TeacherInvitationTemplateData } from './types';

const TEMPLATES = {
  en: renderEn,
  fr: renderFr,
} as const;

export function renderTeacherInvitationEmail(data: TeacherInvitationTemplateData) {
  return TEMPLATES[data.locale]({
    logoUrl: data.logoUrl,
    inviterName: data.inviterName,
    signupUrl: data.signupUrl,
    availableChatbots: data.availableChatbots,
  });
}
