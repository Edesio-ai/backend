import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';
import {
  SupabaseCourse,
  CreateCourseBody,
  Course,
  CourseWithSession,
} from 'src/domain/teaching/course/types/course.type';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { CourseMapper } from '../mappers/course.mapper';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { SessionMapper } from '../../session/mappers/session.mapper';

export class CourseSupabaseRepository implements ICourseRepository {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  public async getCourseById(courseId: string): Promise<Course | null> {
    const { data, error } = await this.supabase.from('courses').select('*').eq('id', courseId).maybeSingle();

    if (error) {
      console.error('An error occurred while getting the course by id: ', courseId, error);
      throw new ServerError(error.message);
    }

    return data ? CourseMapper.toDomain(data as unknown as SupabaseCourse) : null;
  }

  public async getCoursesBySessionId(sessionId: string): Promise<SupabaseCourse[]> {
    const { data, error } = await this.supabase.from('courses').select('id').eq('session_id', sessionId);

    if (error) {
      console.error('An error occurred while getting the courses by session id: ', sessionId, error);
      throw new ServerError(error.message);
    }

    return data as unknown as SupabaseCourse[];
  }

  async deleteCoursesBySessionId(sessionId: string): Promise<void> {
    const { error } = await this.supabase.from('courses').delete().eq('session_id', sessionId);

    if (error) {
      console.error('An error occurred while deleting the courses by session id: ', sessionId, error);
      throw new ServerError(error.message);
    }
  }

  async createCourse(body: CreateCourseBody): Promise<Course> {
    const { data, error } = await this.supabase.from('courses').insert(CourseMapper.toInsert(body)).select().single();

    if (error) {
      console.error('An error occurred while creating the course: ', body, error);
      throw new ServerError(error.message);
    }

    return CourseMapper.toDomain(data);
  }

  async getSessionCoursesCount(sessionId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (error) {
      console.error('An error occurred while getting the session courses count: ', sessionId, error);
      throw new ServerError(error.message);
    }

    return count ?? 0;
  }

  public async getCourseValidatedQuestions(courseId: string): Promise<{ validatedQuestions: boolean }> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('validated_questions')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('An error occurred while getting the validated questions for courseId: ', courseId, error);
      throw new ServerError(error.message);
    }

    return CourseMapper.validatedQuestionsToDomain(data);
  }

  public async getCourseWithSessionById(courseId: string, select: string): Promise<CourseWithSession | null> {
    const { data, error } = await this.supabase.from('courses').select(select).eq('id', courseId).single();

    if (error) {
      console.error('An error occurred while getting the course with session for courseId: ', courseId, error);
      throw new ServerError(error.message);
    }

    return SessionMapper.courseWithSessionToDomain(
      data as unknown as Parameters<typeof SessionMapper.courseWithSessionToDomain>[0],
    );
  }

  public async getSessionCoursesBySessionId(sessionId: string): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('session_id', sessionId)
      .order('position_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('An error occurred while getting the session courses for sessionId: ', sessionId, error);
      throw new ServerError(error.message);
    }

    return data ? data.map(CourseMapper.toDomain) : [];
  }

  public async deleteCourseById(courseId: string): Promise<void> {
    const { error } = await this.supabase.from('courses').delete().eq('id', courseId);

    if (error) {
      console.error('Error deleting course by id: ', courseId, error);
      throw new ServerError(error.message);
    }
  }

  public async updateCourse(courseId: string, updates: Record<string, unknown>): Promise<Course> {
    const { data, error } = await this.supabase
      .from('courses')
      .update(CourseMapper.toUpdate(updates))
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating course: ', courseId, updates, error);
      throw new ServerError(error.message);
    }

    return CourseMapper.toDomain(data);
  }
}
