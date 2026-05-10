import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IStudentCourseStatsRepository } from 'src/domain/teaching/interfaces/i-student-course-stats.repository';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';
import { StudentCourseStatsMapper } from '../mappers/student-course-stats.mapper';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import type {
  StudentCourseStats,
  StudentCourseStatsWithStudent,
} from 'src/domain/teaching/types/student.type';

export class StudentCourseStatsSupabaseRepository implements IStudentCourseStatsRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async getStudentStatsByCourseId(
    courseId: string,
  ): Promise<StudentCourseStatsWithStudent[]> {
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
      throw new ServerError(error.message);
    }
    return StudentCourseStatsMapper.listCourseStatsWithStudentFromQuery(
      data ?? [],
    );
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
      throw new ServerError(error.message);
    }
  }

  public async getStudentCourseStatsByStudentIdAndCourseId(
    studentId: string,
    courseId: string,
  ): Promise<StudentCourseStats | null> {
    const { data, error } = await this.supabase
      .from('student_course_stats')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error(
        `Error getting student course stats by student id and course id: ${studentId} and ${courseId}`,
        error,
      );
      throw new ServerError(error.message);
    }
    return data ? StudentCourseStatsMapper.toDomain(data) : null;
  }

  public async createStudentCourseStats(
    statToInsert: Omit<StudentCourseStats, 'id'>,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_course_stats')
      .insert(StudentCourseStatsMapper.toInsert(statToInsert));

    if (error) {
      console.error('Error creating student course stats', statToInsert, error);
      throw new ServerError(error.message);
    }
  }

  public async updateStudentCourseStats(
    statId: string,
    statToUpdate: Omit<StudentCourseStats, 'id'>,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_course_stats')
      .update(StudentCourseStatsMapper.toUpdate(statToUpdate))
      .eq('id', statId);

    if (error) {
      console.error('Error updating student course stats', statToUpdate, error);
      throw new ServerError(error.message);
    }
  }
}
