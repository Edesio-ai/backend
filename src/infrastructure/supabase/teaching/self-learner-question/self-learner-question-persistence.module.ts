import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase.module';
import { SELF_LEARNER_QUESTION_REPOSITORY } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import { SelfLearnerQuestionRepository } from './repositories/self-learner-question.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: SELF_LEARNER_QUESTION_REPOSITORY,
      useClass: SelfLearnerQuestionRepository,
    },
  ],
  exports: [SELF_LEARNER_QUESTION_REPOSITORY],
})
export class SelfLearnerQuestionPersistenceModule {}
