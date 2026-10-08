import {
  AuthTokenData,
  AuthUser,
  SupabaseAuthSession,
  SupabaseUser,
  User,
  UserMetadata,
  SupabaseUpdateAuthUserPayload,
} from 'src/domain/auth/types/auth.type';

function withAvatarUrl(metadata: UserMetadata, userMetadata?: UserMetadata): UserMetadata {
  const avatarUrl = userMetadata?.avatarUrl;
  if (typeof avatarUrl === 'string' && avatarUrl.length > 0) {
    return { ...metadata, avatarUrl };
  }
  return metadata;
}

export const AuthMapper = {
  toAuthUser: (data: SupabaseAuthSession): AuthUser => ({
    id: data.session.user.id,
    email: data.session.user.email,
    emailConfirmedAt: data.session.user.email_confirmed_at,
    metadata: withAvatarUrl(
      {
        role: data.session.user.user_metadata.role,
        firstname: data.session.user.user_metadata.firstname,
        lastname: data.session.user.user_metadata.lastname,
        establishment: data.session.user.user_metadata.establishment,
        invitationToken: data.session.user.user_metadata.invitationToken,
      },
      data.session.user.user_metadata,
    ),
  }),
  toAuthTokenData: (data: SupabaseAuthSession): AuthTokenData => ({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
  }),
  AuthUserToUser: (user: SupabaseUser): User => ({
    id: user.id,
    email: user.email,
    metadata: withAvatarUrl(
      {
        role: user.user_metadata?.role,
        firstname: user.user_metadata.firstname,
        lastname: user.user_metadata.lastname,
      },
      user.user_metadata,
    ),
  }),
  SupabaseValidatedTokenUserToUser: (user: SupabaseUser): User => ({
    id: user.id,
    email: user.email,
    emailConfirmedAt: user.email_confirmed_at,
    metadata: withAvatarUrl(
      {
        role: user.user_metadata?.role,
        firstname: user.user_metadata?.firstname,
        lastname: user.user_metadata?.lastname,
      },
      user.user_metadata,
    ),
  }),
  toUpdateAuthUser: (payload: Partial<AuthUser>): SupabaseUpdateAuthUserPayload => {
    const { email, metadata, password } = payload;
    const UpdateAuthUserPayload: SupabaseUpdateAuthUserPayload = {};
    if (email) {
      UpdateAuthUserPayload.email = email;
    }
    if (metadata) {
      UpdateAuthUserPayload.user_metadata = metadata;
    }
    if (password) {
      UpdateAuthUserPayload.password = password;
    }
    return UpdateAuthUserPayload;
  },
};
