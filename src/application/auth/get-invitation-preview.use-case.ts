import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { INVITATION_TOKEN_REPOSITORY, type InvitationTokenRepository } from '../../interfaces/persistence/invitation-token.repository';
import { InvitationTokenPreview } from '../../domain/auth/invitation.type';

@Injectable()
export class GetInvitationPreviewUseCase {
  constructor(
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly invitationTokenRepository: InvitationTokenRepository,
  ) {}

  async execute(token: string): Promise<InvitationTokenPreview> {
    if (!token) {
      throw new BadRequestException("Token not found");
    }

    const invitationTokenPreview = await this.invitationTokenRepository.getInvitationPreview(token);
    return invitationTokenPreview;
  }
}