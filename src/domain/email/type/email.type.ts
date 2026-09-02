import { Locale } from 'src/domain/shared/locale.type';

export type EmailBody = {
  invitedEmail: string;
  establishmentName: string;
  invitationToken: string;
  assignedChatbots: number;
  locale?: Locale;
};
