import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServerTokenError } from '../../../domain/token/token.error';
import { SUPABASE_ADMIN } from '../supabase.module';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import { TokenRepository } from 'src/domain/token/contract/token.repository';
import { EstablishmentMapper } from '../teaching/mappers/establishment.mapper';
import { BadRequestError } from 'src/domain/shared/global/errors/global.errors';

export class TokenSupabaseRepository implements TokenRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async deleteInvitationToken(token: string): Promise<void> {
    const { error: deleteError } = await this.supabase
      .from('invitation_tokens')
      .delete()
      .eq('id', token);

    if (deleteError) {
      throw new ServerTokenError(deleteError.message);
    }
  }

  public async getInvitationByToken(token: string): Promise<InvitationToken> {
    const { data, error } = await this.supabase
      .from('invitation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      throw new ServerTokenError(error.message);
    }

    return EstablishmentMapper.invitationTokenToDomain(data);
  }

  public async markInvitationTokenAsUsed(
    tokenId: string,
    teacherId: string,
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from('invitation_tokens')
      .update({
        used_at: new Date().toISOString(),
        used_by: teacherId,
      })
      .eq('id', tokenId)
      .is('used_at', null)
      .select()
      .single();

    if (!data || error) {
      throw new BadRequestError(
        error ? error.message : 'Failed to mark invitation token as used',
      );
    }
    return data;
  }
}
