import type { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';

export function createMockStudentRepository(): jest.Mocked<IStudentRepository> {
  return {
    updateStudent: jest.fn(),
    createStudent: jest.fn(),
    getStudentByUserId: jest.fn(),
    getStudentsByIds: jest.fn(),
    storeStudentPhoto: jest.fn(),
    updateStudentPhoto: jest.fn(),
  };
}
