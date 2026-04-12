import {
  UserMetadata,
  AuthUserWithSession,
  User,
} from '../types/auth.type';
import { InvitationToken, InvitationTokenPreview } from '../invitation.type';
import { CreateInvitationTokenBody } from 'src/application/auth/create-invitation-toke.use-case';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  getInvitationPreview(token: string): Promise<InvitationTokenPreview>;
  createUser(
    email: string,
    password: string,
    metadata: UserMetadata,
    invitationToken?: InvitationToken,
  ): Promise<void>;
  loginUser(email: string, password: string): Promise<AuthUserWithSession>;
  validateToken(token: string): Promise<User>;
  logoutUser(accessToken: string): Promise<void>;
  createInvitationToken(body: CreateInvitationTokenBody): Promise<void>;
}
