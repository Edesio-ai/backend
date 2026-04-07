import { Inject } from '@nestjs/common';
import {
  TOKEN_REPOSITORY,
  type TokenRepository,
} from '../../interfaces/persistence/token.repository';

export class DeleteInvitationTokenUseCase {
  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: TokenRepository,
  ) {}

  async execute(token: string): Promise<void> {
    await this.tokenRepository.deleteInvitationToken(token);
  }
}
