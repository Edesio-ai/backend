import type { ICourseQuestionRepository } from 'src/domain/teaching/interfaces/i-course-question.repository';

export function createMockCourseQuestionRepository(): jest.Mocked<ICourseQuestionRepository> {
  return {
    deleteCourseQuestionsByCourseId: jest.fn(),
    getAnsweredQuestionCount: jest.fn(),
    getCourseQuestionsByCourseId: jest.fn(),
    getPendingQuestionCount: jest.fn(),
  };
}
