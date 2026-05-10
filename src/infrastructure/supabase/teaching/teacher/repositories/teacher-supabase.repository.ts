import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { TeacherMapper } from '../mappers/teacher.mapper';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { TeacherRepository } from 'src/domain/teaching/interfaces/teacher.repository';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';
import { Teacher } from 'src/domain/teaching/types/teacher.type';

export class TeacherSupabaseRepository implements TeacherRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async getTeacherByEstablishmentId(
    establishmentId: string,
  ): Promise<Teacher[]> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .eq('establishment_id', establishmentId);

    if (error) {
      throw new ServerError(error.message);
    }
    return (data ?? []).map(TeacherMapper.toDomain);
  }

  public async getTeacherByUserId(userId: string): Promise<Teacher | null> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();

    if (error) {
      throw new ServerError(error.message);
    }

    return data ? TeacherMapper.toDomain(data) : null;
  }

  public async createTeacher(
    userId: string,
    name: string,
    email: string,
  ): Promise<Teacher | null> {
    const { data, error } = await this.supabase
      .from('teachers')
      .insert(TeacherMapper.toInsert(userId, name, email))
      .select()
      .single();

    if (error) {
      throw new ServerError(error.message);
    }

    return TeacherMapper.toDomain(data);
  }

  public async linkTeacherToEstablishment(
    invitationTokenId: string,
    teacherId: string,
    establishmentId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('teachers')
      .update(TeacherMapper.toEstablishmentUpdate(establishmentId))
      .eq('id', teacherId);

    if (error) {
      await this.supabase
        .from('invitation_tokens')
        .update({ used_at: null, used_by: null })
        .eq('id', invitationTokenId);
      throw new ServerError(error.message);
    }
  }

  public async getTeacherByConditions(
    conditions: Partial<Record<'id' | 'establishmentId' | 'teacherId', string>>,
  ): Promise<Teacher | null> {
    let query = this.supabase.from('teachers').select('*');

    const formatedConditions = TeacherMapper.toCondition(conditions);
    for (const [key, value] of Object.entries(formatedConditions)) {
      query = query.eq(key, value);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error(
        `An error occure while getting teacher by conditions:`,
        error,
      );
      throw new ServerError(error.message);
    }

    return data ? TeacherMapper.toDomain(data) : null;
  }
}
