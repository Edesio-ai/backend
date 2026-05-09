import { Inject } from '@nestjs/common';
import { Session } from 'src/domain/teaching/types/session.type';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interfaces/session.repository';

export class GetSessionByCodeUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(code: string): Promise<Session | null> {
    const session = await this.sessionRepository.getSessionByCode(code);

    return session;
  }
}
