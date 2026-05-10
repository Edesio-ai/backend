import { Inject } from '@nestjs/common';
import {
  CreateSessionBody,
  Session,
} from 'src/domain/teaching/session/types/session.type';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';

export class CreateSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(body: CreateSessionBody): Promise<Session> {
    return await this.sessionRepository.createSession(body);
  }
}
