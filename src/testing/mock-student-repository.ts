import type { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';

export function createMockStudentRepository(): jest.Mocked<IStudentRepository> {
  return {
    createStudent: jest.fn(),
    getStudentByUserId: jest.fn(),
    getStudentsByIds: jest.fn(),
    storeStudentPhoto: jest.fn(),
    updateStudentPhoto: jest.fn(),
  };
}
