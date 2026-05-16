import { Module } from '@nestjs/common';
import { SUGGESTION_REPOSITORY } from 'src/domain/suggestion/contracts/i-suggestion.repository';
import { SuggestionSupabaseRepository } from './repositories/suggestion-supabase.repository';
import { SupabaseModule } from '../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: SUGGESTION_REPOSITORY,
      useClass: SuggestionSupabaseRepository,
    },
  ],
  exports: [SUGGESTION_REPOSITORY],
})
export class SuggestionPersistenceModule {}
