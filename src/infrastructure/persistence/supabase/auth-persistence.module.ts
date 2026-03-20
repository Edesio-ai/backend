import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase.module';
import { AUTH_REPOSITORY } from 'src/interfaces/persistence/auth.repository';
import { AuthSupabaseRepository } from './auth-supabase.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthSupabaseRepository,
    },
  ],
  exports: [AUTH_REPOSITORY],
})
export class authPersistenceModule {}