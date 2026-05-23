import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';

export function createMockSelfLearnerRepository(): jest.Mocked<ISelfLearnerRepository> {
  return {
    getSelfLearnerByUserId: jest.fn(),
    createSelfLearner: jest.fn(),
  };
}
