import { Module } from '@nestjs/common';
import { SESSION_REPOSITORY } from 'src/domain/teaching/interfaces/session.repository';
import { SupabaseSessionRepository } from './repositories/session-supabase.repository';
import { SupabaseModule } from '../../supabase.module';

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
