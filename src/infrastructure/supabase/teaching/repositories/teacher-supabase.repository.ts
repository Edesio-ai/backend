import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { TeacherRepository } from '../../../../domain/teaching/interface/teacher.repository';
import { TeacheServerError } from '../../../../domain/teaching/error';
import {
  Teacher,
  TeacherSession,
} from '../../../../domain/teaching/types/teacher.type';
import {
  createTeacherInsertPayload,
  linkTeacherEstablishmentUpdatePayload,
  supabaseTeacherSessionsToTeacherSessions,
  supabaseTeacherToTeacher,
} from '../mappers/teacher.mapper';

export class TeacherSupabaseRepository implements TeacherRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
  ) {}

  public async getTeacherByEstablishmentId(
    establishmentId: string,
  ): Promise<Teacher[]> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .eq('establishment_id', establishmentId);

    if (error) {
      throw new TeacheServerError(error.message);
    }
    return (data ?? []).map(supabaseTeacherToTeacher);
  }

  public async getTeachersSessionsByIds(
    teacherIds: string[],
  ): Promise<TeacherSession[]> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('id, name, code, language, teacher_id, created_at')
      .in(
        'teacher_id',
        teacherIds.length > 0
          ? teacherIds
          : ['00000000-0000-0000-0000-000000000000'],
      );

    if (error) {
      throw new TeacheServerError(error.message);
    }
    return supabaseTeacherSessionsToTeacherSessions(data ?? []);
  }

  public async getTeacherByUserId(userId: string): Promise<Teacher | null> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();

    if (error) {
      throw new TeacheServerError(error.message);
    }

    if (!data) {
      return null;
    }

    return supabaseTeacherToTeacher(data);
  }

  public async createTeacher(
    userId: string,
    name: string,
    email: string,
  ): Promise<Teacher | null> {
    const { data, error } = await this.supabase
      .from('teachers')
      .insert(createTeacherInsertPayload(userId, name, email))
      .select()
      .single();

    if (error) {
      throw new TeacheServerError(error.message);
    }

    return supabaseTeacherToTeacher(data);
  }

  public async linkTeacherToEstablishment(
    invitationTokenId: string,
    teacherId: string,
    establishmentId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('teachers')
      .update(linkTeacherEstablishmentUpdatePayload(establishmentId))
      .eq('id', teacherId);

    if (error) {
      await this.supabase
        .from('invitation_tokens')
        .update({ used_at: null, used_by: null })
        .eq('id', invitationTokenId);
      throw new TeacheServerError(error.message);
    }
  }
}
