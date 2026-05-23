import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  SELF_LEARNER_REPOSITORY,
  type ISelfLearnerRepository,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { SelfLearner } from 'src/domain/teaching/self-learner/types/self-learner.type';

export class GetSelfLearnerUseCase {
  constructor(
    @Inject(SELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
  ) {}

  async execute(user: AuthUser): Promise<SelfLearner | null> {
    return await this.selfLearnerRepository.getSelfLearnerByUserId(user.id);
  }
}
