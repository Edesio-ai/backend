import { UserMetadata, AuthUserWithSession, User } from '../types/auth.type';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface IAuthRepository {
  createAuthUser(
    email: string,
    password: string,
    metadata: UserMetadata,
  ): Promise<User>;
  loginUser(email: string, password: string): Promise<AuthUserWithSession>;
  validateToken(token: string): Promise<User>;
  logoutUser(accessToken: string): Promise<void>;
}
