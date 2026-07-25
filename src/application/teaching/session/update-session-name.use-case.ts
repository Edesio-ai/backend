import { Inject } from '@nestjs/common';
import { Session, UpdateSessionNameBody } from 'src/domain/teaching/session/types/session.type';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';

export class UpdateSessionNameUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(sessionId: string, body: UpdateSessionNameBody): Promise<Session> {
    return await this.sessionRepository.updateSessionName(sessionId, body);
  }
}
