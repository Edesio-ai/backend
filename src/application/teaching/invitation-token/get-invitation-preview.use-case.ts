import { Inject, Injectable } from '@nestjs/common';
import {} from 'src/domain/auth/contracts/i-auth.repository';
import { InvitationTokenPreview } from 'src/domain/auth/invitation.type';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  INVITATION_TOKEN_REPOSITORY,
  type IInvitationTokenRepository,
} from 'src/domain/invitation-token/contract/i-invtiation-token.repository';

@Injectable()
export class GetInvitationPreviewUseCase {
  constructor(
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly invitationTokenRepository: IInvitationTokenRepository,
  ) {}

  async execute(token: string): Promise<InvitationTokenPreview> {
    if (!token) {
      throw new NotFoundError('Invitation token not found');
    }

    const invitationTokenPreview = await this.invitationTokenRepository.getInvitationPreview(token);
    return invitationTokenPreview;
  }
}
