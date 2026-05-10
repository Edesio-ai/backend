import type { SessionRepository } from 'src/domain/teaching/interfaces/session.repository';

export function createMockSessionRepository(): jest.Mocked<SessionRepository> {
  return {
    createSession: jest.fn(),
    deleteSessionByTeacherId: jest.fn(),
    getSessionByCode: jest.fn(),
    getSessionById: jest.fn(),
    getSessionsByTeacherId: jest.fn(),
    updateSessionName: jest.fn(),
    getTeachersSessionsByIds: jest.fn(),
  };
}
