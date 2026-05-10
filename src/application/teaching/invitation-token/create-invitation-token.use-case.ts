import { Inject } from '@nestjs/common';
import {} from 'src/domain/auth/contracts/i-auth.repository';
import {
  INVITATION_TOKEN_REPOSITORY,
  type IInvitationTokenRepository,
} from 'src/domain/invitation-token/contract/i-invtiation-token.repository';

export type CreateInvitationTokenBody = {
  establishmentId: string;
  token: string;
  invitedEmail: string;
  expiresAt: Date;
  assignedChatbots: number;
};

export class CreateInvitationTokenUseCase {
  constructor(
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly invitationTokenRepository: IInvitationTokenRepository,
  ) {}

  async execute(body: CreateInvitationTokenBody): Promise<void> {
    return await this.invitationTokenRepository.createInvitationToken(body);
  }
}
