import type { ICourseQuestionRepository } from 'src/domain/teaching/course-question/contracts/i-course-question.repository';

export function createMockCourseQuestionRepository(): jest.Mocked<ICourseQuestionRepository> {
  return {
    createCourseQuestion: jest.fn(),
    deleteCourseQuestionsByCourseId: jest.fn(),
    getAnsweredQuestionCount: jest.fn(),
    getCourseQuestionsByCourseId: jest.fn(),
    getPendingQuestionCount: jest.fn(),
  };
}
