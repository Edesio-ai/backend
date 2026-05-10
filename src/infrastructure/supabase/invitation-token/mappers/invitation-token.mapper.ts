import { CreateInvitationTokenBody } from 'src/application/teaching/invitation-token/create-invitation-token.use-case';
import {
  InvitationToken,
  InvitationTokenPreview,
  SupabaseInvitationTokenInsert,
  SupabaseInvitationTokenRow,
} from 'src/domain/auth/invitation.type';
import { SupabaseInvitationTokenUpdate } from 'src/domain/invitation-token/types/invitation-token.type';
import { SupabaseTeacherInsert } from 'src/domain/teaching/teacher/types/teacher.type';

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

  toInsert(body: CreateInvitationTokenBody): SupabaseInvitationTokenInsert {
    return {
      establishment_id: body.establishmentId,
      token: body.token,
      invited_email: body.invitedEmail,
      expires_at: body.expiresAt.toISOString(),
      assigned_chatbots: body.assignedChatbots,
    };
  },

  toInsertWithEstablishment: (
    userId: string,
    name: string,
    email: string,
    establishmentId: string,
    availableChatbots: number,
  ): SupabaseTeacherInsert => ({
    supabase_user_id: userId,
    name,
    email: email.toLowerCase().trim(),
    establishment_id: establishmentId,
    available_chatbots: availableChatbots,
  }),

  toPreview(
    data: {
      assigned_chatbots: number;
      establishment?: { name: string } | { name: string }[] | null;
    },
    maskedEmail: string,
  ): InvitationTokenPreview {
    const establishment = data.establishment;
    const row = Array.isArray(establishment) ? establishment[0] : establishment;

    return {
      isValid: true,
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
