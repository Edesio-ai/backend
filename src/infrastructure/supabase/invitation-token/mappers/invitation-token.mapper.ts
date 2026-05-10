import {
  InvitationToken,
  SupabaseInvitationTokenRow,
} from 'src/domain/auth/invitation.type';

export const invitationTokenMapper = {
  toDomain: (row: SupabaseInvitationTokenRow): InvitationToken => ({
    id: row.id,
    establishmentId: row.establishment_id,
    token: row.token,
    invitedEmail: row.invited_email,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    usedBy: row.used_by,
    createdAt: row.created_at,
    assignedChatbots: row.assigned_chatbots,
  }),
};
