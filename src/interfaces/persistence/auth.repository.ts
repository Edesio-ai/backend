import { UserMetadata } from "../../domain/auth/sign-up.type";
import { InvitationToken, InvitationTokenPreview } from "../../domain/auth/invitation.type";

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  getInvitationPreview(token: string): Promise<InvitationTokenPreview>;
  valideInvitationToken(token: string, email: string): Promise<InvitationToken>;
  createUser(email: string, password: string, metadata: UserMetadata, invitationToken?: InvitationToken): Promise<void>;
}