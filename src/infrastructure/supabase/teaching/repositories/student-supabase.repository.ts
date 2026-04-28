import { Inject } from '@nestjs/common';
import { StudentRepository } from '../../../../domain/teaching/interface/student.repository';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { StudentServerError } from '../../../../domain/teaching/error';
import {
  supabaseStudentCourseStatsToStudentCourseStats,
  supabaseStudentSessionsToStudentSessions,
} from '../mappers/student.mapper';
import { StudentCourseStats } from 'src/domain/teaching/types/student.type';

export class StudentSupabaseRepository implements StudentRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
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
      throw new StudentServerError(error.message);
    }
    return supabaseStudentSessionsToStudentSessions(data ?? []);
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
      throw new StudentServerError(error.message);
    }
  }

  public async getStudentStatsByCourseId(
    courseId: string,
  ): Promise<StudentCourseStats[]> {
    const { data, error } = await this.supabase
      .from('student_course_stats')
      .select(
        `
        student_id,
        attempted_questions,
        correct_answers,
        last_attempt_at,
        students (
          id,
          name,
          email,
          photo_url
        )
      `,
      )
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'An error occurred while getting student stats by course id',
        courseId,
        error,
      );
      throw new StudentServerError(error.message);
    }
    return supabaseStudentCourseStatsToStudentCourseStats(data ?? []);
  }

  public async deleteStudentCourseStatsByCourseId(
    courseId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_course_stats')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'Error deleting student course stats for course id: ',
        courseId,
        error,
      );
      throw new StudentServerError(error.message);
    }
  }
}
