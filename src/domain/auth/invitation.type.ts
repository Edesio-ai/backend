import { SupabaseEstablishment } from '../teaching/establishment/types/establishment.type';

export type InvitationTokenPreview = {
  isValid: true;
  maskedEmail: string;
  establishmentName: string;
  assignedChatbots: number;
};

export type InvitationToken = {
  id: string;
  establishmentId: string;
  token: string;
  firstname: string;
  lastname: string;
  invitedEmail: string;
  expiresAt: string;
  usedAt: string | null;
  usedBy: string | null;
  createdAt: string;
  assignedChatbots: number;
};

export type SupabaseInvitationTokenRow = {
  id: string;
  establishment_id: string;
  token: string;
  firstname: string;
  lastname: string;
  invited_email: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
  assigned_chatbots: number;
};

export type SupabaseInvitationTokenInsert = Omit<
  SupabaseInvitationTokenRow,
  'id' | 'used_at' | 'used_by' | 'created_at'
>;

/** Ligne preview : colonnes invitation + jointure `establishment (name)`. */
export type SupabaseInvitationToken = {
  invited_email: string;
  assigned_chatbots: number;
  expires_at: string;
  used_at: string | null;
  establishment: Pick<SupabaseEstablishment, 'name'>;
};
