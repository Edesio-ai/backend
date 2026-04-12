import { SupabaseEstablishment } from '../establishment/establishment.type';

export type InvitationTokenPreview = {
  isValid: true;
  maskedEmail: string;
  establishmentName: string;
  assignedChatbots: number;
};

export type InvitationToken = {
  id: string;
  establishment_id: string;
  token: string;
  invited_email: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
  assigned_chatbots: number;
};

export type SupabaseInvitationTokenInsert = Omit<
  InvitationToken,
  'id' | 'used_at' | 'used_by' | 'created_at'
>;
export type SupabaseInvitationToken = Omit<
  InvitationToken,
  'id' | 'used_by' | 'created_at' | 'token' | 'invited_email'
> & {
  establishment: SupabaseEstablishment;
};
