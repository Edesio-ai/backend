import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase.module';
import { AUTH_REPOSITORY } from 'src/domain/auth/contract/auth.repository';
import { AuthSupabaseRepository } from './repositories/auth-supabase.repository';
import { SupabaseAuthModule } from '../supabase-auth.module';

@Module({
  imports: [SupabaseAuthModule, SupabaseModule],
  providers: [
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthSupabaseRepository,
    },
  ],
  exports: [AUTH_REPOSITORY],
})
export class AuthPersistenceModule {}
