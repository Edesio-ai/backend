import type { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';

export function createMockQuestionsRepository(): jest.Mocked<IQuestionsRepository> {
  return {
    deleteCourseQuizQuestions: jest.fn(),
    deleteQuestionById: jest.fn(),
    deleteQuestionsByCourseIds: jest.fn(),
    getCourseQuestions: jest.fn(),
    getQuestionById: jest.fn(),
    insertQuestion: jest.fn(),
    insertQuestions: jest.fn(),
    updateQuestionById: jest.fn(),
  };
}
