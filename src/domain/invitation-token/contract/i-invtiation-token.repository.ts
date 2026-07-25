import { CreateInvitationTokenBody } from 'src/application/teaching/invitation-token/create-invitation-token.use-case';
import { InvitationToken, InvitationTokenPreview } from 'src/domain/auth/invitation.type';

export const INVITATION_TOKEN_REPOSITORY = Symbol('INVITATION_TOKEN_REPOSITORY');

export interface IInvitationTokenRepository {
  deleteInvitationToken(token: string): Promise<void>;
  getInvitationByToken(token: string): Promise<InvitationToken | null>;
  markInvitationTokenAsUsed(tokenId: string, teacherId: string): Promise<void>;
  getInvitationTokenByEstablishmentId(establishmentId: string): Promise<InvitationToken[]>;
  createInvitationToken(body: CreateInvitationTokenBody): Promise<void>;
  getInvitationPreview(token: string): Promise<InvitationTokenPreview>;
  updateTokenUsedAt(tokenId: string, teacherId: string): Promise<void>;
}
