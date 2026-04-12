import { Module } from '@nestjs/common';
import { TokenSupabaseRepository } from './token-supabase.repository';
import { TOKEN_REPOSITORY } from 'src/domain/token/contract/token.repository';
import { SupabaseModule } from '../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: TOKEN_REPOSITORY,
      useClass: TokenSupabaseRepository,
    },
  ],
  exports: [TOKEN_REPOSITORY],
})
export class TokenPersistenceModule {}
