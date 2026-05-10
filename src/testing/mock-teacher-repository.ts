import type { TeacherRepository } from 'src/domain/teaching/interfaces/teacher.repository';

export function createMockTeacherRepository(): jest.Mocked<TeacherRepository> {
  return {
    createTeacher: jest.fn(),
    getTeacherByConditions: jest.fn(),
    getTeacherByEstablishmentId: jest.fn(),
    getTeacherByUserId: jest.fn(),
    linkTeacherToEstablishment: jest.fn(),
  };
}
