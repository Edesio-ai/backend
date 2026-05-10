import type { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';

export function createMockSessionRepository(): jest.Mocked<ISessionRepository> {
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
