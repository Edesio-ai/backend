import { Module } from '@nestjs/common';
import { SuggestionController } from './suggestion.controller';
import { GetSuggestionsUseCase } from 'src/application/suggestion/get-suggestions.use-case';
import { SuggestionPersistenceModule } from 'src/infrastructure/supabase/suggestion/suggestion-persistence.module';
import { LikeSuggestionUseCase } from 'src/application/suggestion/like-suggestion.use-case';
import { SuggestionLikePersistenceModule } from 'src/infrastructure/supabase/suggestion-like/suggestion-like-persistence.module';

@Module({
  imports: [SuggestionPersistenceModule, SuggestionLikePersistenceModule],
  controllers: [SuggestionController],
  providers: [GetSuggestionsUseCase, LikeSuggestionUseCase],
})
export class SuggestionModule {}
