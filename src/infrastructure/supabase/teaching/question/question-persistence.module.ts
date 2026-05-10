import { Module } from '@nestjs/common';
import { QUESTIONS_REPOSITORY } from 'src/domain/teaching/interfaces/questions.repository';
import { QuestionSupabaseRepository } from '../question/repositories/question-supabase.repository';
import { SupabaseModule } from '../../supabase.module';

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
