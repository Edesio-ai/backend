import { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { ICourseQuestionRepository } from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import {
  CourseQuestion,
  CourseQuestionAnswer,
  CourseQuestionToInsert,
} from 'src/domain/teaching/course-question/types/course-question.type';
import { CourseQuestionMapper } from '../mappers/course-question.mapper';
import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';

export class CourseQuestionSupabaseRepository implements ICourseQuestionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async getPendingQuestionCount(courseIds: string[]): Promise<number> {
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

  public async getAnsweredQuestionCount(studentId: string): Promise<number> {
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

  public async getCourseQuestionsByCourseId(
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
  public async createCourseQuestion(
    courseQuestion: CourseQuestionToInsert,
  ): Promise<CourseQuestion | null> {
    const { data, error } = await this.supabase
      .from('course_questions')
      .insert(CourseQuestionMapper.toInsert(courseQuestion))
      .select()
      .single();

    if (error) {
      console.error('error creating course question', courseQuestion, error);
      throw new ServerError(error.message);
    }
    return data ? CourseQuestionMapper.toDomain(data) : null;
  }

  public async getCourseQuestionByCourseId(
    courseQuestionId: string,
  ): Promise<CourseQuestion | null> {
    const { data, error } = await this.supabase
      .from('course_questions')
      .select('*')
      .eq('id', courseQuestionId)
      .single();

    if (error) {
      console.error(
        'error getting course question by course id',
        courseQuestionId,
        error,
      );
      throw new ServerError(error.message);
    }

    return data ? CourseQuestionMapper.toDomain(data) : null;
  }

  public async updateCourseQuestion(
    courseQuestionId: string,
    updatePayload: CourseQuestionAnswer,
  ): Promise<CourseQuestion | null> {
    const { data, error } = await this.supabase
      .from('course_questions')
      .update(CourseQuestionMapper.toAnswer(updatePayload))
      .eq('id', courseQuestionId)
      .select()
      .single();

    if (error) {
      console.error(
        'error updating course question',
        courseQuestionId,
        updatePayload,
        error,
      );
      throw new ServerError(error.message);
    }

    return data ? CourseQuestionMapper.toDomain(data) : null;
  }
}
