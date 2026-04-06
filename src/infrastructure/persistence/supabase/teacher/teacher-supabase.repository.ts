import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../supabase.module';
import { TeacherRepository } from '../../../../interfaces/persistence/teacher.repository';
import {
  TeacherNotFoundError,
  TeacherSessionsNotFoundError,
} from '../../../../domain/teaching/error';
import {
  Teacher,
  TeacherSession,
} from '../../../../domain/teaching/teacher.type';

export class TeacherSupabaseRepository implements TeacherRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
  ) {}

  async getTeacherByEstablishmentId(
    establishmentId: string,
  ): Promise<Teacher[]> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('id, name, email, created_at')
      .eq('establishment_id', establishmentId);

    if (error) {
      throw new TeacherNotFoundError(error.message);
    }
    return data;
  }

  async getTeachersSessionsByIds(
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
      throw new TeacherSessionsNotFoundError(error.message);
    }
    return data;
  }
}
