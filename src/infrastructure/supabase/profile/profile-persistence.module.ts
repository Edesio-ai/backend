import { Module } from '@nestjs/common';
import { PROFILE_REPOSITORY } from 'src/domain/profile/contracts/i-profile.repository';
import { SupabaseModule } from '../supabase.module';
import { ProfileSupabaseRepository } from './repositories/profile-supabase.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileSupabaseRepository,
    },
  ],
  exports: [PROFILE_REPOSITORY],
})
export class ProfilePersistenceModule {}
