import type { IStudentCourseStatsRepository } from 'src/domain/teaching/student-course-stats/contracts/i-student-course-stats.repository';

export function createMockStudentCourseStatsRepository(): jest.Mocked<IStudentCourseStatsRepository> {
  return {
    getStudentCourseStatsByCourseId: jest.fn(),
    deleteStudentCourseStatsByCourseId: jest.fn(),
    getStudentCourseStatsByStudentIdAndCourseId: jest.fn(),
    createStudentCourseStats: jest.fn(),
    updateStudentCourseStats: jest.fn(),
  };
}
