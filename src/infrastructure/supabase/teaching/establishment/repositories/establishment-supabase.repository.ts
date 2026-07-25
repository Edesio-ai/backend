import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_ADMIN } from '../../../supabase.module';
import { Establishment } from 'src/domain/teaching/establishment/types/establishment.type';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { IEstablishmentRepository } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import { EstablishmentMapper } from '../mappers/establishment.mapper';
import { UpdateStudentPayload } from 'src/domain/teaching/student/type/student.type';

export class EstablishmentSupabaseRepository implements IEstablishmentRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  async getEstablishmentById(establishmentId: string): Promise<Establishment | null> {
    const { data, error } = await this.supabase.from('establishment').select('*').eq('id', establishmentId).single();

    if (error || !data) {
      console.error(`An error occure while getting establishment by id: ${establishmentId}, error: ${error}`);
      throw new ServerError(`An error occure while getting establishment by id`);
    }
    return EstablishmentMapper.toDomain(data);
  }

  async getEstablishmentByUserId(userId: string): Promise<Establishment | null> {
    const { data, error } = await this.supabase
      .from('establishment')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(`An error occure while getting establishment by user id: ${userId}, error: ${error}`);
      throw new ServerError(`An error occure while getting establishment by user id`);
    }
    return data ? EstablishmentMapper.toDomain(data) : null;
  }

  async createEstablishment(supabaseUserId: string, name: string, email: string): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from('establishment')
      .insert(EstablishmentMapper.toInsert({ supabaseUserId, name, email }))
      .select()
      .single();

    if (error || !data) {
      console.error(`An error occure while creating establishment: ${error}`);
      throw new ServerError(`An error occure while creating establishment`);
    }

    return EstablishmentMapper.toDomain(data);
  }

  async updateEstablishment(userId: string, payload: UpdateStudentPayload): Promise<void> {
    const { error } = await this.supabase.from('establishment').update(payload).eq('supabase_user_id', userId);

    if (error) {
      console.error(`An error occure while updating establishment: ${userId}, error: ${error}`);
      throw new ServerError(`An error occure while updating establishment`);
    }
  }
}
