import { CreateInvitationTokenBody } from 'src/application/auth/create-invitation-toke.use-case';
import {
  InvitationTokenPreview,
  SupabaseInvitationToken,
  SupabaseInvitationTokenInsert,
} from 'src/domain/auth/invitation.type';
import {
  AuthTokenData,
  AuthUser,
  Session,
  SupabaseUser,
  User,
} from 'src/domain/auth/types/auth.type';

export function invitationTokenToSupabase(
  body: CreateInvitationTokenBody,
): SupabaseInvitationTokenInsert {
  return {
    establishment_id: body.establishmentId,
    token: body.token,
    invited_email: body.invitedEmail,
    expires_at: body.expiresAt.toISOString(),
    assigned_chatbots: body.assignedChatbots,
  };
}

export function supabaseSessionToAuthUser(data: Session): AuthUser {
  return {
    id: data.session.user.id,
    email: data.session.user.email,
    emailConfirmedAt: data.session.user.email_confirmed_at,
    metadata: {
      role: data.session.user.user_metadata.role,
      firstname: data.session.user.user_metadata.firstname,
      lastname: data.session.user.user_metadata.lastname,
      establishment: data.session.user.user_metadata.establishment,
      invitationToken: data.session.user.user_metadata.invitationToken,
    },
  };
}

export function supabaseSessionToAuthTokenData(data: Session): AuthTokenData {
  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
  };
}

export function supabaseInvitationTokenToInvitationTokenPreview(
  data: SupabaseInvitationToken,
  maskedEmail: string,
): InvitationTokenPreview {
  return {
    isValid: true,
    maskedEmail: maskedEmail,
    establishmentName: data.establishment.name,
    assignedChatbots: data.assigned_chatbots,
  };
}

export function SupabaseAuthUserToUser(user: SupabaseUser): User {
  return {
    id: user.id,
    email: user.email,
    metadata: {
      firstname: user.user_metadata.firstname,
      lastname: user.user_metadata.lastname,
    },
  };
}

export function supabaseValidatedTokenUserToUser(user: SupabaseUser): User {
  return {
    id: user.id,
    email: user.email,
    metadata: {
      role: user.user_metadata?.role,
      firstname: user.user_metadata?.firstname,
      lastname: user.user_metadata?.lastname,
      establishment: user.user_metadata?.establishment,
      invitationToken: user.user_metadata?.invitationToken,
    },
  };
}
