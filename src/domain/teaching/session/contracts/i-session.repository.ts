import { CreateSessionBody, Session, UpdateSessionNameBody } from 'src/domain/teaching/session/types/session.type';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface ISessionRepository {
  getSessionsByTeacherId(teacherId: string): Promise<Session[]>;
  getSessionByCode(code: string): Promise<Session | null>;
  createSession(body: CreateSessionBody): Promise<Session>;
  updateSessionName(sessionId: string, body: UpdateSessionNameBody): Promise<Session>;
  deleteSessionByTeacherId(sessionId: string, teacherId: string): Promise<void>;
  getSessionById(sessionId: string): Promise<Session | null>;
  getTeachersSessionsByIds(teacherIds: string[]): Promise<Session[]>;
}
