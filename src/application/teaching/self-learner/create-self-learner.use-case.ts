import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ISELF_LEARNER_REPOSITORY,
  type ISelfLearnerRepository,
} from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { SelfLearner } from 'src/domain/teaching/self-learner/types/self-learner.type';

export class CreateSelfLearnerUseCase {
  constructor(
    @Inject(ISELF_LEARNER_REPOSITORY)
    private readonly selfLearnerRepository: ISelfLearnerRepository,
  ) {}

  async execute(user: AuthUser): Promise<SelfLearner> {
    const name =
      user.metadata?.firstname && user.metadata?.lastname
        ? `${user.metadata.firstname} ${user.metadata.lastname}`
        : user.metadata?.firstname || 'Apprenant';

    const payload = {
      supabaseUserId: user.id,
      name,
      email: user.email,
    };

    return await this.selfLearnerRepository.createSelfLearner(payload);
  }
}
