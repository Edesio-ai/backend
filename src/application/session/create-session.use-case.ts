import { Inject } from '@nestjs/common';
import { CreateSessionBody, Session } from 'src/domain/teaching/session.type';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/interfaces/persistence/session.repository';

export class CreateSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(body: CreateSessionBody): Promise<Session> {
    return await this.sessionRepository.createSession(body);
  }
}
