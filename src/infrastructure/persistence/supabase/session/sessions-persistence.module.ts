import { Module } from '@nestjs/common';
import { SESSION_REPOSITORY } from '../../../../domain/teaching/interface/session.repository';
import { SupabaseSessionRepository } from './session-supabase.repository';
import { SupabaseModule } from '../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: SESSION_REPOSITORY,
      useClass: SupabaseSessionRepository,
    },
  ],
  exports: [SESSION_REPOSITORY],
})
export class SessionsPersistenceModule {}
