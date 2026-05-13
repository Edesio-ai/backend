import type { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';

export function createMockTeacherRepository(): jest.Mocked<ITeacherRepository> {
  return {
    createTeacher: jest.fn(),
    createTeacherWithInvitationToken: jest.fn(),
    getTeacherByConditions: jest.fn(),
    getTeacherByEstablishmentId: jest.fn(),
    getTeacherByUserId: jest.fn(),
    linkTeacherToEstablishment: jest.fn(),
    updateTeacher: jest.fn(),
  };
}
