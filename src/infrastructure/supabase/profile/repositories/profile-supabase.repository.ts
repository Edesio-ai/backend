import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { IProfileRepository } from 'src/domain/profile/contracts/i-profile.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';

export class ProfileSupabaseRepository implements IProfileRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async storeProfilePhoto(buffer: Buffer, storagePath: string): Promise<string> {
    const { error } = await this.supabase.storage.from('profile-photos').upload(storagePath, buffer, { upsert: true });

    if (error) {
      console.error('Error uploading profile photo:', error);
      throw new ServerError(error.message);
    }

    const { data } = this.supabase.storage.from('profile-photos').getPublicUrl(storagePath);

    return data.publicUrl ?? '';
  }
}
