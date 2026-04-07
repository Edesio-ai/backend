import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServerTokenError } from '../../../../domain/token/token.error';
import { SUPABASE_ADMIN } from '../supabase.module';

export class TokenSupabaseRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  async deleteInvitationToken(token: string): Promise<void> {
    const { error: deleteError } = await this.supabase
      .from('invitation_tokens')
      .delete()
      .eq('id', token);

    if (deleteError) {
      throw new ServerTokenError(deleteError.message);
    }
  }
}
