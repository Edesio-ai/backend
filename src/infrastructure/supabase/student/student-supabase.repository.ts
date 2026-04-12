import { Inject } from '@nestjs/common';
import { StudentRepository } from '../../../domain/teaching/interface/student.repository';
import { SUPABASE_ADMIN } from '../supabase.module';
import { StudentSessionsNotFoundError } from '../../../domain/teaching/error';

export class StudentSupabaseRepository implements StudentRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
  ) {}

  async getStudentsSessionsByIds(sessionIds: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('student_sessions')
      .select('session_id, student_id')
      .in(
        'session_id',
        sessionIds.length > 0
          ? sessionIds
          : ['00000000-0000-0000-0000-000000000000'],
      );

    if (error) {
      throw new StudentSessionsNotFoundError(error.message);
    }
    return data;
  }

  async deleteStudentSessionsBySessionId(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('student_sessions')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      throw new StudentSessionsNotFoundError(error.message);
    }
  }
}
