import type { StudentRepository } from 'src/domain/teaching/interfaces/student.repository';

export function createMockStudentRepository(): jest.Mocked<StudentRepository> {
  return {
    createStudent: jest.fn(),
    getStudentByUserId: jest.fn(),
    getStudentsByIds: jest.fn(),
    storeStudentPhoto: jest.fn(),
    updateStudentPhoto: jest.fn(),
  };
}
