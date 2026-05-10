import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase.module';
import {
  InvitationToken,
  InvitationTokenPreview,
} from 'src/domain/auth/invitation.type';
import { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import {
  BadRequestError,
  ServerError,
} from 'src/domain/shared/errors/global.errors';
import { invitationTokenMapper } from '../mappers/invitation-token.mapper';
import { CreateInvitationTokenBody } from 'src/application/teaching/invitation-token/create-invitation-token.use-case';

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

  public async createInvitationToken(
    body: CreateInvitationTokenBody,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('invitation_tokens')
      .insert(invitationTokenMapper.toInsert(body))
      .select()
      .single();

    if (error) {
      console.error(
        'An error occurred while creating the invitation token: ',
        body,
        error,
      );
      throw new ServerError(error.message);
    }

    return;
  }

  public async getInvitationPreview(
    token: string,
  ): Promise<InvitationTokenPreview> {
    const { data, error } = await this.supabase
      .from('invitation_tokens')
      .select(
        `
          invited_email,
          assigned_chatbots,
          expires_at,
          used_at,
          establishment:establishment!invitation_tokens_establishment_id_fkey ( name )
        `,
      )
      .eq('token', token)
      .single();

    if (!data || error) {
      throw new ServerError(error?.message);
    }

    if (data.used_at) {
      throw new BadRequestError('Invitation token already used');
    }

    const expiresAt = new Date(data.expires_at);

    if (expiresAt < new Date()) {
      throw new BadRequestError('Invitation token expired');
    }

    const maskedEmail = this.maskEmail(data.invited_email);

    return invitationTokenMapper.toPreview(data, maskedEmail);
  }

  public async updateTokenUsedAt(
    tokenId: string,
    teacherId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('invitation_tokens')
      .update(invitationTokenMapper.toUpdateUsedAt(teacherId))
      .eq('id', tokenId)
      .is('used_at', null);

    if (error) {
      throw new ServerError(error.message);
    }
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***';
    if (localPart.length <= 2) {
      return `${'*'.repeat(localPart.length)}@${domain}`;
    }
    const visibleStart = localPart[0];
    const visibleEnd = localPart[localPart.length - 1];
    const hidden = '*'.repeat(localPart.length - 2);
    return `${visibleStart}${hidden}${visibleEnd}@${domain}`;
  }
}
