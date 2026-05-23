import { Module } from '@nestjs/common';
import { SELF_LEARNER_REPOSITORY } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { SelfLearnerRepository } from './repositories/self-learner.repository';
import { SupabaseModule } from '../../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: SELF_LEARNER_REPOSITORY,
      useClass: SelfLearnerRepository,
    },
  ],
  exports: [SELF_LEARNER_REPOSITORY],
})
export class SelfLearnerPersistenceModule {}
