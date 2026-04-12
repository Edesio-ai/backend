import { Inject } from '@nestjs/common';
import { Session } from 'src/domain/teaching/types/session.type';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interface/session.repository';

export class GetSessionByCodeUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly teacherSessionsRepository: SessionRepository,
  ) {}

  async execute(code: string): Promise<Session | null> {
    const session = await this.teacherSessionsRepository.getSessionByCode(code);

    return session;
  }
}
