import { SelfLearner, SelfLearnerToInsert } from '../types/self-learner.type';

export const SELF_LEARNER_REPOSITORY = Symbol('SELF_LEARNER_REPOSITORY');

export interface ISelfLearnerRepository {
  getSelfLearnerByUserId(userId: string): Promise<SelfLearner | null>;
  createSelfLearner(payload: SelfLearnerToInsert): Promise<SelfLearner>;
}
