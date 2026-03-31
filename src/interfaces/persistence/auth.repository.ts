import { UserMetadata, Session, User } from "../../domain/auth/auth.type";
import { InvitationToken, InvitationTokenPreview } from "../../domain/auth/invitation.type";

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  getInvitationPreview(token: string): Promise<InvitationTokenPreview>;
  valideInvitationToken(token: string, email: string): Promise<InvitationToken>;
  createUser(email: string, password: string, metadata: UserMetadata, invitationToken?: InvitationToken): Promise<void>;
  loginUser(email: string, password: string): Promise<Session>;
  validateToken(token: string): Promise<User>;
  logoutUser(accessToken: string): Promise<void>;
}