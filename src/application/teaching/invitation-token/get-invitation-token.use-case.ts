import { Inject } from '@nestjs/common';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  INVITATION_TOKEN_REPOSITORY,
  type IInvitationTokenRepository,
} from 'src/domain/invitation-token/contract/i-invtiation-token.repository';

export class GetInvitationTokenUseCase {
  constructor(
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly invitationTokenRepository: IInvitationTokenRepository,
  ) {}

  async execute(establishmentId: string): Promise<InvitationToken[]> {
    if (!establishmentId) {
      throw new NotFoundError('Establishment id not found');
    }
    const invitationTokens = await this.invitationTokenRepository.getInvitationTokenByEstablishmentId(establishmentId);
    return invitationTokens;
  }
}
