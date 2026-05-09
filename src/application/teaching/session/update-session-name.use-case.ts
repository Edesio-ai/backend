import { Inject } from '@nestjs/common';
import {
  Session,
  UpdateSessionNameBody,
} from 'src/domain/teaching/types/session.type';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interfaces/session.repository';

export class UpdateSessionNameUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(
    sessionId: string,
    body: UpdateSessionNameBody,
  ): Promise<Session> {
    return await this.sessionRepository.updateSessionName(sessionId, body);
  }
}
