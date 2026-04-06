import { ProfesseurInvitationTemplateData } from "./professeur-invitation-email.types";

export function buildProfesseurInvitationTemplateData(params: {
  inviterName: string;
  invitationToken: string;
  availableChatbots: number;
  appUrl: string;
  logoUrl: string;
}): ProfesseurInvitationTemplateData {
  return {
    inviterName: params.inviterName,
    signupUrl: `${params.appUrl}/register/teacher/${params.invitationToken}`,
    appUrl: params.appUrl,
    logoUrl: params.logoUrl,
    availableChatbots: params.availableChatbots,
  };
}