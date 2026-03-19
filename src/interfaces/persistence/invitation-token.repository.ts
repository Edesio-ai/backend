import { InvitationTokenPreview } from "src/domain/auth/invitation.type";
export const INVITATION_TOKEN_REPOSITORY = Symbol('INVITATION_TOKEN_READ_REPOSITORY');

export interface InvitationTokenRepository {
  getInvitationPreview(token: string): Promise<InvitationTokenPreview>;
}