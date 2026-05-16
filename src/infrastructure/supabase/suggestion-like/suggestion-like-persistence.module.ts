import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase.module';
import { SuggestionLikeSupabaseRepository } from './repositories/suggestion-like-supabase.repository';
import { SUGGESTION_LIKE_REPOSITORY } from '../../../domain/suggestion-like/contracts/suggestion-like.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: SUGGESTION_LIKE_REPOSITORY,
      useClass: SuggestionLikeSupabaseRepository,
    },
  ],
  exports: [SUGGESTION_LIKE_REPOSITORY],
})
export class SuggestionLikePersistenceModule {}
