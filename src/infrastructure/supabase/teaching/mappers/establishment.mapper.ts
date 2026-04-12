import {
  InvitationToken,
  SupabaseInvitationTokenRow,
} from 'src/domain/auth/invitation.type';
import {
  CreateEstablishmentBody,
  Establishment,
  SupabaseEstablishment,
} from 'src/domain/establishment/establishment.type';

type SupabaseEstablishmentInsert = {
  supabase_user_id: string;
  name: string;
  email: string;
};

export function createEstablishmentBodyToSupabaseEstablishmentInsert(
  body: CreateEstablishmentBody,
): SupabaseEstablishmentInsert {
  return {
    supabase_user_id: body.supabaseUserId,
    name: body.name,
    email: body.email,
  };
}

export function supabaseEstablishmentToEstablishment(
  row: SupabaseEstablishment,
): Establishment {
  return {
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
}

export function supabaseInvitationTokenRowToInvitationToken(
  row: SupabaseInvitationTokenRow,
): InvitationToken {
  return {
    id: row.id,
    establishmentId: row.establishment_id,
    token: row.token,
    invitedEmail: row.invited_email,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    usedBy: row.used_by,
    createdAt: row.created_at,
    assignedChatbots: row.assigned_chatbots,
  };
}
