import type { QuestionsRepository } from 'src/domain/teaching/interfaces/questions.repository';

export function createMockQuestionsRepository(): jest.Mocked<QuestionsRepository> {
  return {
    deleteCourseQuestionsByCourseId: jest.fn(),
    deleteCourseQuizQuestions: jest.fn(),
    deleteQuestionById: jest.fn(),
    deleteQuestionsByCourseIds: jest.fn(),
    getAnsweredQuestionCount: jest.fn(),
    getCourseQuestions: jest.fn(),
    getPendingQuestionCount: jest.fn(),
    getQuestionById: jest.fn(),
    getStudentCourseQuestions: jest.fn(),
    insertQuestion: jest.fn(),
    insertQuestions: jest.fn(),
    updateQuestionById: jest.fn(),
  };
}
