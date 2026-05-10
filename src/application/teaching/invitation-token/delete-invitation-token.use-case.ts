import { Inject } from '@nestjs/common';
import {
  INVITATION_TOKEN_REPOSITORY,
  type IInvitationTokenRepository,
} from 'src/domain/token/contract/token.repository';

export class DeleteInvitationTokenUseCase {
  constructor(
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly tokenRepository: IInvitationTokenRepository,
  ) {}

  async execute(token: string): Promise<void> {
    await this.tokenRepository.deleteInvitationToken(token);
  }
}
