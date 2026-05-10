import {
  AuthTokenData,
  AuthUser,
  SupabaseAuthSession,
  SupabaseUser,
  User,
} from 'src/domain/auth/types/auth.type';

export const AuthMapper = {
  toAuthUser: (data: SupabaseAuthSession): AuthUser => ({
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
  }),
  toAuthTokenData: (data: SupabaseAuthSession): AuthTokenData => ({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
  }),
  AuthUserToUser: (user: SupabaseUser): User => ({
    id: user.id,
    email: user.email,
    metadata: {
      firstname: user.user_metadata.firstname,
      lastname: user.user_metadata.lastname,
    },
  }),
  SupabaseValidatedTokenUserToUser: (user: SupabaseUser): User => ({
    id: user.id,
    email: user.email,
    metadata: {
      role: user.user_metadata?.role,
      firstname: user.user_metadata?.firstname,
      lastname: user.user_metadata?.lastname,
    },
  }),
};
