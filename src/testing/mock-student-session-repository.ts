import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';

export function createMockStudentSessionRepository(): jest.Mocked<IStudentSessionRepository> {
  return {
    getStudentsSessionsByIds: jest.fn(),
    deleteStudentSessionsBySessionId: jest.fn(),
    listSessionsEnrolledByStudent: jest.fn(),
    listStudentsEnrolledInSession: jest.fn(),
    getStudentSession: jest.fn(),
    createStudentSession: jest.fn(),
    deleteStudentSession: jest.fn(),
  };
}
