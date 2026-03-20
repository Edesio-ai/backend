import { InvitationToken, InvitationTokenPreview } from "../../domain/auth/invitation.type";

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  getInvitationPreview(token: string): Promise<InvitationTokenPreview>;
  valideInvitationToken(token: string, email: string): Promise<InvitationToken>;
  createTeacher(email: string, password: string, firstname: string, lastname: string, invitationToken: InvitationToken): Promise<void>;
}