import { CreateInvitationTokenBody } from 'src/application/teaching/invitation-token/create-invitation-token.use-case';
import {
  InvitationToken,
  InvitationTokenPreview,
  SupabaseInvitationTokenInsert,
  SupabaseInvitationTokenRow,
} from 'src/domain/auth/invitation.type';
import { SupabaseInvitationTokenUpdate } from 'src/domain/invitation-token/types/invitation-token.type';

export const invitationTokenMapper = {
  toDomain: (row: SupabaseInvitationTokenRow): InvitationToken => ({
    id: row.id,
    establishmentId: row.establishment_id,
    token: row.token,
    firstname: row.firstname,
    lastname: row.lastname,
    invitedEmail: row.invited_email,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    usedBy: row.used_by,
    createdAt: row.created_at,
    assignedChatbots: row.assigned_chatbots,
  }),

  toInsert(body: CreateInvitationTokenBody): SupabaseInvitationTokenInsert {
    return {
      establishment_id: body.establishmentId,
      token: body.token,
      firstname: body.firstname,
      lastname: body.lastname,
      invited_email: body.invitedEmail,
      expires_at: body.expiresAt.toISOString(),
      assigned_chatbots: body.assignedChatbots,
    };
  },

  toPreview(
    data: {
      firstname?: string | null;
      lastname?: string | null;
      invited_email?: string | null;
      assigned_chatbots: number;
      establishment?: { name: string } | { name: string }[] | null;
    },
    maskedEmail: string,
  ): InvitationTokenPreview {
    const establishment = data.establishment;
    const row = Array.isArray(establishment) ? establishment[0] : establishment;

    return {
      isValid: true,
      firstname: data.firstname ?? '',
      lastname: data.lastname ?? '',
      invitedEmail: data.invited_email ?? '',
      maskedEmail,
      establishmentName: row?.name ?? '',
      assignedChatbots: data.assigned_chatbots,
    };
  },

  toUpdateUsedAt(teacherId: string): SupabaseInvitationTokenUpdate {
    return {
      used_at: new Date().toISOString(),
      used_by: teacherId,
    };
  },
};
