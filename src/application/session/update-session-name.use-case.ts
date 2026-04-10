import { Inject } from '@nestjs/common';
import {
  Session,
  UpdateSessionNameBody,
} from '../../domain/teaching/session.type';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from '../../interfaces/persistence/session.repository';

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
