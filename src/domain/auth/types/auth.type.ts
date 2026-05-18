export type SignUpTeacherBody = {
  token: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
};

export type SupabaseAuthSession = {
  user: SupabaseUserSession;
  session: SupabaseSession;
};

export type AuthUserWithSession = {
  authUser: AuthUser;
  session: AuthTokenData;
};

export type AuthTokenData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type SupabaseSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  refresh_token: string;
  user: SupabaseUserSession;
  weak_password: boolean | null;
};
export type SupabaseUserSession = SupabaseUser & {
  confirmed_at: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
};

export type SupabaseUser = {
  id: string;
  email: string;
  email_confirmed_at: string;
  user_metadata: UserMetadata;
};

export type UserMetadata = {
  [key: string]: any;
};

export type RegisterBody = {
  role: Role;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  acceptTerms: boolean;
  establishment?: string;
  invitationToken?: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type GetUserSessionResponse = {
  user: User | null;
  role: Role | null;
};

export type Role = 'teacher' | 'establishment' | 'student' | 'standalone';

export type AuthUser = {
  id: string;
  email: string;
  emailConfirmedAt?: string | null;
  metadata: UserMetadata;
  password?: string;
};

export type User = {
  id: string;
  email: string;
  emailConfirmedAt?: string | null;
  metadata: UserMetadata;
};

export type UpdateAuthUserPayload = Partial<AuthUser>;

export type SupabaseUpdateAuthUserPayload = {
  email?: string;
  user_metadata?: UserMetadata;
  password?: string;
};
