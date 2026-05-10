import { Module } from '@nestjs/common';
import { InvitationTokenSupabaseRepository } from './repositories/invtiation-token-supabase.repository';
import { INVITATION_TOKEN_REPOSITORY } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { SupabaseModule } from '../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: INVITATION_TOKEN_REPOSITORY,
      useClass: InvitationTokenSupabaseRepository,
    },
  ],
  exports: [INVITATION_TOKEN_REPOSITORY],
})
export class InvitationTokenPersistenceModule {}
