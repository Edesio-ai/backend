import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase.module';
import { INVITATION_TOKEN_REPOSITORY } from 'src/interfaces/persistence/invitation-token.repository';
import { SupabaseInvitationTokenRepository } from './invitation-token-supabase.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: INVITATION_TOKEN_REPOSITORY,
      useClass: SupabaseInvitationTokenRepository,
    },
  ],
  exports: [INVITATION_TOKEN_REPOSITORY],
})
export class InvitationTokenSupabaseModule {}