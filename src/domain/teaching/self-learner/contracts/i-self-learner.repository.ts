import { SelfLearner, SelfLearnerToInsert } from '../types/self-learner.type';

export const ISELF_LEARNER_REPOSITORY = Symbol('ISELF_LEARNER_REPOSITORY');

export interface ISelfLearnerRepository {
  getSelfLearnerByUserId(userId: string): Promise<SelfLearner | null>;
  createSelfLearner(payload: SelfLearnerToInsert): Promise<SelfLearner>;
}
