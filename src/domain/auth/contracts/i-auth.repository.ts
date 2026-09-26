import { UserMetadata, AuthUserWithSession, User, UpdateAuthUserPayload } from '../types/auth.type';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface IAuthRepository {
  createAuthUser(email: string, password: string, metadata: UserMetadata): Promise<User>;
  loginUser(email: string, password: string): Promise<AuthUserWithSession>;
  validateToken(token: string): Promise<User>;
  refreshSession(refreshToken: string): Promise<AuthUserWithSession>;
  logoutUser(accessToken: string): Promise<void>;
  updateAuthUser(userId: string, payload: UpdateAuthUserPayload): Promise<void>;
  resetPasswordByEmail(email: string): Promise<void>;
  existsUserByEmail(email: string): Promise<boolean>;
  getAuthUserIdByEmail(email: string): Promise<string | null>;
  deleteAuthUser(userId: string): Promise<void>;
}
