import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import { IInvitationTokenRepository } from 'src/domain/token/contract/token.repository';
import {
  BadRequestError,
  ServerError,
} from 'src/domain/shared/global/errors/global.errors';
import { invitationTokenMapper } from '../mappers/invitation-token.mapper';

export class InvitationTokenSupabaseRepository implements IInvitationTokenRepository {
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
      throw new ServerError(
        `Error deleting invitation token: ${deleteError.message}`,
      );
    }
  }

  public async getInvitationByToken(token: string): Promise<InvitationToken> {
    const { data, error } = await this.supabase
      .from('invitation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      throw new ServerError(
        `Error getting invitation by token: ${error.message}`,
      );
    }

    return invitationTokenMapper.toDomain(data);
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

  async getInvitationTokenByEstablishmentId(
    establishmentId: string,
  ): Promise<InvitationToken[]> {
    const { data, error } = await this.supabase
      .from('invitation_tokens')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        `An error occure while getting invitation token by establishment id: ${establishmentId}, error: ${error}`,
      );
      throw new ServerError(
        `An error occure while getting invitation token by establishment id`,
      );
    }

    return (data ?? []).map(invitationTokenMapper.toDomain);
  }
}
