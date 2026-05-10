import type { QuestionsRepository } from 'src/domain/teaching/interfaces/questions.repository';

export function createMockQuestionsRepository(): jest.Mocked<QuestionsRepository> {
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
