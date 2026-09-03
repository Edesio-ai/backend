import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY, type IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import {
  INVITATION_TOKEN_REPOSITORY,
  type IInvitationTokenRepository,
} from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { InvitationEmailAlreadyRegisteredError } from 'src/domain/shared/errors/global.errors';

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
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(body: CreateInvitationTokenBody): Promise<void> {
    const { invitedEmail } = body;

    const emailAlreadyRegistered = await this.authRepository.existsUserByEmail(invitedEmail);

    if (emailAlreadyRegistered) {
      throw new InvitationEmailAlreadyRegisteredError();
    }

    return await this.invitationTokenRepository.createInvitationToken(body);
  }
}
