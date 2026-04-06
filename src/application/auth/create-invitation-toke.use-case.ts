import { Inject } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from '../../interfaces/persistence/auth.repository';

export type CreateInvitationTokenBody = {
  establishmentId: string;
  token: string;
  invitedEmail: string;
  expiresAt: Date;
  assignedChatbots: number;
};

export class CreateInvitationTokenUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(body: CreateInvitationTokenBody): Promise<void> {
    const {
      establishmentId,
      token,
      invitedEmail,
      expiresAt,
      assignedChatbots,
    } = body;
    return await this.authRepository.createInvitationToken(
      establishmentId,
      token,
      invitedEmail,
      expiresAt,
      assignedChatbots,
    );
  }
}
