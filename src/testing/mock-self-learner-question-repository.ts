import type { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';

export function createMockSelfLearnerQuestionRepository(): jest.Mocked<ISelfLearnerQuestionRepository> {
  return {
    deleteSelfLearnerQuestionsByCourseId: jest.fn(),
    getSelfLearnerQuestions: jest.fn(),
    insertSelfLearnerQuestions: jest.fn(),
  };
}
