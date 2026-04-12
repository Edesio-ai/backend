import { Inject } from '@nestjs/common';

import { type EstablishmentRepository } from 'src/domain/teaching/interface/establishment.repository';
import { SUPABASE_ADMIN } from '../../supabase.module';
import {
  EstablishmentCreationFailedError,
  EstablishmentNotFoundError,
} from '../../../../domain/establishment/error';
import { Establishment } from '../../../../domain/establishment/establishment.type';
import { InvitationTokenNotFoundError } from '../../../../domain/auth/errors/auth.errors';
import { InvitationToken } from '../../../../domain/auth/invitation.type';

export class EstablishmentSupabaseRepository implements EstablishmentRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
  ) {}

  async getEstablishmentById(establishmentId: string): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from('establishment')
      .select('*')
      .eq('id', establishmentId)
      .single();

    if (error || !data) {
      throw new EstablishmentNotFoundError(error.message);
    }
    return data;
  }

  async getEstablishmentByUserId(userId: string): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from('establishment')
      .select('*')
      .eq('supabase_user_id', userId)
      .single();

    if (error || !data) {
      throw new EstablishmentNotFoundError(error.message);
    }
    return data;
  }

  async createEstablishment(
    supabaseUserId: string,
    name: string,
    email: string,
  ): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from('establishment')
      .insert({
        supabase_user_id: supabaseUserId,
        name: name,
        email: email,
      })
      .select()
      .single();

    if (error || !data) {
      throw new EstablishmentCreationFailedError(error.message);
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
      throw new InvitationTokenNotFoundError(error.message);
    }
    return data;
  }
}
