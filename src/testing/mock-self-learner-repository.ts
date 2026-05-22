import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';

export function createMockSelfLearnerRepository(): jest.Mocked<ISelfLearnerRepository> {
  return {
    getSelfLearneByUserId: jest.fn(),
    createSelfLearner: jest.fn(),
  };
}
