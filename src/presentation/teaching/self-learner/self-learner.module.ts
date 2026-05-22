import { Module } from '@nestjs/common';
import { GetSelfLearnerUseCase } from 'src/application/teaching/self-learner/get-self-learner.use-case';
import { SelfLearnerController } from './self-learner.controller';
import { SelfLearnerPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner/self-learner-persistence.module';
import { CreateSelfLearnerUseCase } from 'src/application/teaching/self-learner/create-self-learner.use-case';

@Module({
  imports: [SelfLearnerPersistenceModule],
  controllers: [SelfLearnerController],
  providers: [GetSelfLearnerUseCase, CreateSelfLearnerUseCase],
})
export class SelfLearnerModule {}
