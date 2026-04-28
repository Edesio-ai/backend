import { Inject } from '@nestjs/common';

import { type EstablishmentRepository } from 'src/domain/teaching/interface/establishment.repository';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { Establishment } from '../../../../domain/establishment/establishment.type';
import { InvitationToken } from '../../../../domain/auth/invitation.type';
import {
  createEstablishmentBodyToSupabaseEstablishmentInsert,
  supabaseEstablishmentToEstablishment,
  supabaseInvitationTokenRowToInvitationToken,
} from '../mappers/establishment.mapper';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';

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
      console.error(
        `An error occure while getting establishment by id: ${establishmentId}, error: ${error}`,
      );
      throw new ServerError(
        `An error occure while getting establishment by id`,
      );
    }
    return supabaseEstablishmentToEstablishment(data);
  }

  async getEstablishmentByUserId(userId: string): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from('establishment')
      .select('*')
      .eq('supabase_user_id', userId)
      .single();

    if (error || !data) {
      console.error(
        `An error occure while getting establishment by user id: ${userId}, error: ${error}`,
      );
      throw new ServerError(
        `An error occure while getting establishment by user id`,
      );
    }
    return supabaseEstablishmentToEstablishment(data);
  }

  async createEstablishment(
    supabaseUserId: string,
    name: string,
    email: string,
  ): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from('establishment')
      .insert(
        createEstablishmentBodyToSupabaseEstablishmentInsert({
          supabaseUserId,
          name,
          email,
        }),
      )
      .select()
      .single();

    if (error || !data) {
      console.error(`An error occure while creating establishment: ${error}`);
      throw new ServerError(`An error occure while creating establishment`);
    }

    return supabaseEstablishmentToEstablishment(data);
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

    return (data ?? []).map(supabaseInvitationTokenRowToInvitationToken);
  }
}
