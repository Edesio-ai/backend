import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import type { IStudentSessionRepository } from 'src/domain/teaching/interfaces/i-student-session.repository';
import { mapList } from 'src/infrastructure/supabase/common/mapper.util';
import type {
  SessionStudent,
  StudentJoinedSession,
  StudentSession,
} from 'src/domain/teaching/types/student.type';
import { SUPABASE_ADMIN } from '../../../supabase.module';
import { StudentSessionMapper } from '../mappers/student-session.mapper';

@Injectable()
export class StudentSessionRepository implements IStudentSessionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async getStudentsSessionsByIds(sessionIds: string[]) {
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
      console.error(
        'An error occurred while getting students sessions by ids',
        sessionIds,
        error,
      );
      throw new ServerError(error.message);
    }
    return mapList(data ?? [], StudentSessionMapper.toDomain);
  }

  public async deleteStudentSessionsBySessionId(
    sessionId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_sessions')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error(
        'An error occurred while deleting student sessions by session id',
        sessionId,
        error,
      );
      throw new ServerError(error.message);
    }
  }

  public async listSessionsEnrolledByStudent(
    studentId: string,
  ): Promise<StudentJoinedSession[]> {
    const { data, error } = await this.supabase
      .from('student_sessions')
      .select('joined_at, sessions (*)')
      .eq('student_id', studentId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error(
        'An error occurred while listing sessions enrolled by student',
        studentId,
        error,
      );
      throw new ServerError(error.message);
    }
    return StudentSessionMapper.mapEnrollmentRowsWithEmbeddedSessions(
      data ?? [],
    );
  }

  public async listStudentsEnrolledInSession(
    sessionId: string,
    select: string = '*',
  ): Promise<SessionStudent[]> {
    const { data, error } = await this.supabase
      .from('student_sessions')
      .select(select)
      .eq('session_id', sessionId);

    if (error) {
      console.error(
        'An error occurred while listing students enrolled in session',
        sessionId,
        error,
      );
      throw new ServerError(error.message);
    }
    return StudentSessionMapper.mapEnrollmentRowsWithEmbeddedStudents(
      data ?? [],
    );
  }

  public async getStudentSessionBySessionId(
    sessionId: string,
  ): Promise<StudentSession | null> {
    const { data, error } = await this.supabase
      .from('student_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error(
        'An error occurred while getting student session by session id',
        sessionId,
        error,
      );
      throw new ServerError(error.message);
    }
    return data ? StudentSessionMapper.toDomain(data) : null;
  }

  public async createStudentSession(
    studentId: string,
    sessionId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_sessions')
      .insert({ student_id: studentId, session_id: sessionId });

    if (error) {
      console.error(
        'An error occurred while creating student session',
        studentId,
        sessionId,
      );
      throw new ServerError(error.message);
    }
  }

  public async deleteStudentSession(
    sessionId: string,
    studentId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_sessions')
      .delete()
      .eq('session_id', sessionId)
      .eq('student_id', studentId);

    if (error) {
      console.error(
        `Error deleting student session for session id: ${sessionId} and student id: ${studentId}`,
        error,
      );
      throw new ServerError(error.message);
    }
  }
}
