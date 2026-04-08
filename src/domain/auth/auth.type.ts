export type SignUpTeacherBody = {
  token: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
};

export type Session = {
  user: UserSession;
  session: AuthSession;
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  refresh_token: string;
  user: UserSession;
  weak_password: boolean | null;
};
export type UserSession = User & {
  confirmed_at: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
};

type AppMetadata = {
  provider: string;
  providers: string[];
};

export type UserMetadata = {
  [key: string]: any;
};

type Identity = {
  id: string;
  user_id: string;
  identity_data: IdentityData;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
};

type IdentityData = {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
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
