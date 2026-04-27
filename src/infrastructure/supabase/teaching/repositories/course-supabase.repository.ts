import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { CourseRepository } from 'src/domain/teaching/interface/course.repository';
import {
  SupabaseCourse,
  CourseFileUpload,
  CreateCourseBody,
  Course,
  CourseFile,
  CourseWithSession,
} from 'src/domain/teaching/types/course.type';
import { CourseServerError } from 'src/domain/teaching/error';
import {
  courseCourseBodyToSupabaseCourseInsert,
  mapFilesUrl,
  supabaseCourseFileToCourseFile,
  supabaseCourseToCourse,
  supabaseValidatedQuestionsToValidatedQuestions,
  updatesToSupabaseCourseUpdate,
} from '../mappers/course.mapper';
import { supabaseCourseWithSessionToCourseWithSession } from '../mappers/session.mapper';

export class CourseSupabaseRepository implements CourseRepository {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: any) {}

  async getCourseById(courseId: string): Promise<Course> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('id, session_id')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error(
        'An error occurred while getting the course by id: ',
        courseId,
        error,
      );
      throw new CourseServerError(error.message);
    }

    return supabaseCourseToCourse(data);
  }

  async getCoursesBySessionId(sessionId: string): Promise<SupabaseCourse[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('id')
      .eq('session_id', sessionId);

    if (error) {
      throw new CourseServerError(error.message);
    }

    return data;
  }

  async deleteCoursesFilesByCourseIds(courseIds: string[]): Promise<void> {
    for (const courseId of courseIds) {
      const files = await this.getCoursesFilesByCourseIds(courseId);
      if (files && files.length > 0) {
        const filePaths = files.map((file) => file.fileUrl);
        await this.deleteCoursesFilesFromStorage(filePaths);
        await this.deleteCourseFileFromDatabase(courseId);
      }
    }
  }

  private async deleteCourseFileFromDatabase(courseId: string): Promise<void> {
    const { error } = await this.supabase
      .from('course_files')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'Error deleting course files for course id: ',
        courseId,
        error,
      );
      throw new CourseServerError(error.message);
    }
  }

  async deleteCoursesBySessionId(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('courses')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      throw new CourseServerError(error.message);
    }
  }

  async createCourse(body: CreateCourseBody): Promise<Course> {
    const { data, error } = await this.supabase
      .from('courses')
      .insert(courseCourseBodyToSupabaseCourseInsert(body))
      .select()
      .single();

    if (error) {
      throw new CourseServerError(error.message);
    }

    return supabaseCourseToCourse(data);
  }

  private async getCoursesFilesByCourseIds(
    courseId: string,
  ): Promise<{ fileUrl: string }[]> {
    const { data, error } = await this.supabase
      .from('course_files')
      .select('file_url')
      .eq('course_id', courseId);

    if (error) {
      throw new CourseServerError(error.message);
    }

    return mapFilesUrl(data);
  }

  private async deleteCoursesFilesFromStorage(files: string[]): Promise<void> {
    const { error } = await this.supabase.storage
      .from('courses-pdf')
      .remove(files);

    if (error) {
      throw new CourseServerError(error.message);
    }
  }

  async getSessionCoursesCount(sessionId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (error) {
      throw new CourseServerError(error.message);
    }

    return count;
  }

  public async storeCourseFile(
    file: CourseFileUpload,
    storagePath: string,
  ): Promise<void> {
    const { error: uploadError } = await this.supabase.storage
      .from('courses-pdf')
      .upload(storagePath, file.buffer, {
        contentType: file.mimeType || 'application/octet-stream',
        upsert: false,
      });
    if (uploadError) {
      throw new CourseServerError(uploadError.message);
    }
  }

  public async insertCourseFile(
    courseId: string,
    file: CourseFileUpload,
    storagePath: string,
  ): Promise<CourseFile> {
    const { data, error } = await this.supabase
      .from('course_files')
      .insert({
        course_id: courseId,
        file_url: storagePath,
        file_name: file.originalFileName,
      })
      .select()
      .single();

    if (error) {
      await this.supabase.storage
        .from('courses-pdf')
        .remove([storagePath])
        .catch(() => undefined);
      throw new CourseServerError(error.message);
    }

    return supabaseCourseFileToCourseFile(data);
  }

  public async getCourseValidatedQuestions(
    courseId: string,
  ): Promise<{ validatedQuestions: boolean }> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('validated_questions')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error(
        'An error occurred while getting the validated questions for courseId: ',
        courseId,
        error,
      );
      throw new CourseServerError(error.message);
    }

    return supabaseValidatedQuestionsToValidatedQuestions(data);
  }

  public async getCourseFilesByCourseId(
    courseId: string,
  ): Promise<CourseFile[]> {
    const { data, error } = await this.supabase
      .from('course_files')
      .select('*')
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'An error occurred while getting the course files for courseId: ',
        courseId,
        error,
      );
      throw new CourseServerError(error.message);
    }

    return data.map(supabaseCourseFileToCourseFile);
  }

  public async getCourseWithSessionById(
    courseId: string,
    select: string,
  ): Promise<CourseWithSession> {
    const { data, error } = await this.supabase
      .from('courses')
      .select(select)
      .eq('id', courseId)
      .single();

    if (error) {
      console.error(
        'An error occurred while getting the course with session for courseId: ',
        courseId,
        error,
      );
      throw new CourseServerError(error.message);
    }

    return supabaseCourseWithSessionToCourseWithSession(data);
  }

  public async getSessionCoursesBySessionId(
    sessionId: string,
  ): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('session_id', sessionId)
      .order('position_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        'An error occurred while getting the session courses for sessionId: ',
        sessionId,
        error,
      );
      throw new CourseServerError(error.message);
    }

    return data ? data.map(supabaseCourseToCourse) : [];
  }

  public async getFileBufferFromStorage(filePath: string): Promise<Buffer> {
    const { data: fileData, error } = await this.supabase.storage
      .from('courses-pdf')
      .download(filePath);

    if (error) {
      console.error(`Error downloading file from storage: ${filePath}`, error);
      throw new CourseServerError(error.message);
    }

    return Buffer.from(await fileData.arrayBuffer());
  }

  public async deleteCourseById(courseId: string): Promise<void> {
    const { error } = await this.supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('Error deleting course by id: ', courseId, error);
      throw new CourseServerError(error.message);
    }
  }

  public async updateCourse(
    courseId: string,
    updates: Record<string, unknown>,
  ): Promise<Course> {
    const { data, error } = await this.supabase
      .from('courses')
      .update(updatesToSupabaseCourseUpdate(updates))
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating course: ', courseId, updates, error);
      throw new CourseServerError(error.message);
    }

    return supabaseCourseToCourse(data);
  }
}
