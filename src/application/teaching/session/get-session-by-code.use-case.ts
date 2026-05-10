import { Inject } from '@nestjs/common';
import { Session } from 'src/domain/teaching/session/types/session.type';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';

export class GetSessionByCodeUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(code: string): Promise<Session | null> {
    const session = await this.sessionRepository.getSessionByCode(code);

    return session;
  }
}
