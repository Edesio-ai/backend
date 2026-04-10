import {
  CreateSessionBody,
  Session,
  UpdateSessionNameBody,
} from 'src/domain/teaching/session.type';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface SessionRepository {
  getSessionsByTeacherId(teacherId: string): Promise<Session[]>;
  getSessionByCode(code: string): Promise<Session>;
  createSession(body: CreateSessionBody): Promise<Session>;
  updateSessionName(
    sessionId: string,
    body: UpdateSessionNameBody,
  ): Promise<Session>;
  deleteSessionByTeacherId(sessionId: string, teacherId: string): Promise<void>;
}
