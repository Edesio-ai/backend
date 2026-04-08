import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../supabase.module';
import { SessionRepository } from '../../../../interfaces/persistence/session.repository';
import { Session } from '../../../../domain/teaching/session.type';
import { SessionServerError } from '../../../../domain/teaching/error';

export class SupabaseSessionRepository implements SessionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
  ) {}

  async getSessionsByTeacherId(teacherId: string): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new SessionServerError(error.message);
    }

    return data;
  }
}
