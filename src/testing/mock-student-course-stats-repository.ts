import type { IStudentCourseStatsRepository } from 'src/domain/teaching/interfaces/i-student-course-stats.repository';

export function createMockStudentCourseStatsRepository(): jest.Mocked<IStudentCourseStatsRepository> {
  return {
    getStudentStatsByCourseId: jest.fn(),
    deleteStudentCourseStatsByCourseId: jest.fn(),
    getStudentCourseStatsByStudentIdAndCourseId: jest.fn(),
    createStudentCourseStats: jest.fn(),
    updateStudentCourseStats: jest.fn(),
  };
}
