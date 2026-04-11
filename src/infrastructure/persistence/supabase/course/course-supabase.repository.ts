import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../supabase.module';
import { CourseRepository } from 'src/interfaces/persistence/course.repository';
import {
  Course,
  CourseFile,
  CourseFileUpload,
  CreateCourseBody,
} from 'src/domain/teaching/course.type';
import { CourseServerError } from 'src/domain/teaching/error';

export class CourseSupabaseRepository implements CourseRepository {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: any) {}

  async getCoursesBySessionId(sessionId: string): Promise<Course[]> {
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
        const filePaths = files.map((file) => file.file_url);
        await this.deleteCoursesFilesFromStorage(filePaths);
      }
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
      .insert({
        session_id: body.sessionId,
        title: body.title,
        description: body.description,
        text_content: body.contentText,
      })
      .select()
      .single();

    if (error) {
      throw new CourseServerError(error.message);
    }

    return data;
  }

  private async getCoursesFilesByCourseIds(
    courseId: string,
  ): Promise<{ file_url: string }[]> {
    const { data, error } = await this.supabase
      .from('course_files')
      .select('file_url')
      .eq('course_id', courseId);

    if (error) {
      throw new CourseServerError(error.message);
    }

    return data;
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
    courseId: string,
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

    return data;
  }
}
