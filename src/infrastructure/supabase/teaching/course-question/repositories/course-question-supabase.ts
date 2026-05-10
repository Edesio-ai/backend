import { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { ICourseQuestionRepository } from 'src/domain/teaching/interfaces/i-course-question.repository';
import { CourseQuestion } from 'src/domain/teaching/types/course-question.type';
import { CourseQuestionMapper } from '../mappers/course-question.mapper';

export class CourseQuestionSupabaseRepository implements ICourseQuestionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getPendingQuestionCount(courseIds: string[]): Promise<number> {
    const { count, error: countError } = await this.supabase
      .from('course_questions')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .is('answer', null);

    if (countError) {
      console.error(
        'error getting pending question count for course ids',
        courseIds,
        countError,
      );
      throw new ServerError(countError.message);
    }

    return count ?? 0;
  }

  public async deleteCourseQuestionsByCourseId(
    courseId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('course_questions')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'error deleting course questions by course id',
        courseId,
        error,
      );
      throw new ServerError(error.message);
    }
  }

  async getAnsweredQuestionCount(studentId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('course_questions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .not('answer', 'is', null);

    if (error) {
      console.error(
        'error getting answered question count for student id',
        studentId,
        error,
      );
      throw new ServerError(error.message);
    }

    return count ?? 0;
  }

  async getCourseQuestionsByCourseId(
    courseId: string,
  ): Promise<CourseQuestion[]> {
    const { data, error } = await this.supabase
      .from('course_questions')
      .select('*')
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'error getting student course questions for course id',
        courseId,
        error,
      );
      throw new ServerError(error.message);
    }

    return data?.map(CourseQuestionMapper.toDomain) ?? [];
  }
}
