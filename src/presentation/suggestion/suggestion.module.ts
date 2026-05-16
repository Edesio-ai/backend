import { Module } from '@nestjs/common';
import { SuggestionController } from './suggestion.controller';
import { GetSuggestionsUseCase } from 'src/application/suggestion/get-suggestions.use-case';
import { SuggestionPersistenceModule } from 'src/infrastructure/supabase/suggestion/suggestion-persistence.module';

@Module({
  imports: [SuggestionPersistenceModule],
  controllers: [SuggestionController],
  providers: [GetSuggestionsUseCase],
})
export class SuggestionModule {}
