import { CreateSessionBody, Session } from 'src/domain/teaching/session.type';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface SessionRepository {
  getSessionsByTeacherId(teacherId: string): Promise<Session[]>;
  getSessionByCode(code: string): Promise<Session>;
  createSession(body: CreateSessionBody): Promise<Session>;
}
