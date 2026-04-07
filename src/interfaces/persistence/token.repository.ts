export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');

export interface TokenRepository {
  deleteInvitationToken(token: string): Promise<void>;
}
