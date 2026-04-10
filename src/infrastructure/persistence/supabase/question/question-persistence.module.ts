import { Module } from '@nestjs/common';
import { QUESTIONS_REPOSITORY } from '../../../../interfaces/persistence/questions.repository';
import { QuestionSupabaseRepository } from './question-supabase.repository';
import { SupabaseModule } from '../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: QUESTIONS_REPOSITORY,
      useClass: QuestionSupabaseRepository,
    },
  ],
  exports: [QUESTIONS_REPOSITORY],
})
export class QuestionPersistenceModule {}
