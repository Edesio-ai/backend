import { InvitationToken } from 'src/domain/auth/invitation.type';

export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');

export interface TokenRepository {
  deleteInvitationToken(token: string): Promise<void>;
  getInvitationByToken(token: string): Promise<InvitationToken>;
  markInvitationTokenAsUsed(tokenId: string, teacherId: string): Promise<void>;
}
