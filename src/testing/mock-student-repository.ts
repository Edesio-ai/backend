import type { StudentRepository } from 'src/domain/teaching/interfaces/student.repository';

export function createMockStudentRepository(): jest.Mocked<StudentRepository> {
  return {
    createStudent: jest.fn(),
    createStudentCourseStats: jest.fn(),
    createStudentSession: jest.fn(),
    deleteStudentCourseStatsByCourseId: jest.fn(),
    deleteStudentSession: jest.fn(),
    deleteStudentSessionsBySessionId: jest.fn(),
    getStudentByUserId: jest.fn(),
    getStudentCourseStatsByStudentIdAndCourseId: jest.fn(),
    getStudentJoinedSessions: jest.fn(),
    getStudentSessionBySessionId: jest.fn(),
    getStudentSessionsBySessionId: jest.fn(),
    getStudentStatsByCourseId: jest.fn(),
    getStudentsByIds: jest.fn(),
    getStudentsSessionsByIds: jest.fn(),
    storeStudentPhoto: jest.fn(),
    updateStudentCourseStats: jest.fn(),
    updateStudentPhoto: jest.fn(),
  };
}
