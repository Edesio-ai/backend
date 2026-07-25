import { Inject } from '@nestjs/common';
import { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { CourseFile, CourseFileUpload } from 'src/domain/teaching/course-file/types/course-file.type';
import { courseFileMapper } from '../mappers/course-file.mapper';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';

export class CourseFileRepository implements ICourseFileRepository {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  public async deleteFileById(fileId: string): Promise<void> {
    const file = await this.getCourseFileById(fileId);
    if (!file) {
      throw new ServerError(`Course file not found: ${fileId}`);
    }
    await this.deleteFileFromStorage(file.fileUrl);

    const { error } = await this.supabase.from('course_files').delete().eq('id', fileId);

    if (error) {
      console.error(`Error deleting file from database: ${fileId}`, error);
      throw new ServerError(error.message);
    }
  }

  public async getCourseFileById(fileId: string): Promise<CourseFile | null> {
    const { data, error } = await this.supabase.from('course_files').select('*').eq('id', fileId).single();

    if (error) {
      console.error(`Error getting course file by id: ${fileId}`, error);
      throw new ServerError(error.message);
    }

    return courseFileMapper.toDomain(data);
  }

  public async deleteFileFromStorage(fileUrl: string): Promise<void> {
    const { error } = await this.supabase.storage.from('courses-pdf').remove([fileUrl]);

    if (error) {
      console.error(`Error deleting file from storage: ${fileUrl}`, error);
      throw new ServerError(error.message);
    }
  }

  public async getFileBufferFromStorage(filePath: string): Promise<Buffer | null> {
    const { data: fileData, error } = await this.supabase.storage.from('courses-pdf').download(filePath);

    if (error) {
      console.error(`Error downloading file from storage: ${filePath}`, error);
      throw new ServerError(error.message);
    }

    return Buffer.from(await fileData.arrayBuffer());
  }

  public async getCourseFilesByCourseId(courseId: string): Promise<CourseFile[]> {
    const { data, error } = await this.supabase.from('course_files').select('*').eq('course_id', courseId);

    if (error) {
      console.error('An error occurred while getting the course files for courseId: ', courseId, error);
      throw new ServerError(error.message);
    }

    return data.map(courseFileMapper.toDomain);
  }

  public async insertCourseFile(courseId: string, file: CourseFileUpload, storagePath: string): Promise<CourseFile> {
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
      console.error('An error occurred while inserting the course file: ', storagePath, error);
      throw new ServerError(error.message);
    }

    return courseFileMapper.toDomain(data);
  }

  public async storeCourseFile(file: CourseFileUpload, storagePath: string): Promise<void> {
    const { error: uploadError } = await this.supabase.storage.from('courses-pdf').upload(storagePath, file.buffer, {
      contentType: file.mimeType || 'application/octet-stream',
      upsert: false,
    });
    if (uploadError) {
      console.error('An error occurred while uploading the course file: ', storagePath, uploadError);
      throw new ServerError(uploadError.message);
    }
  }

  public async deleteCoursesFilesByCourseIds(courseIds: string[]): Promise<void> {
    for (const courseId of courseIds) {
      const files = await this.getCoursesFilesByCourseIds(courseId);
      if (files && files.length > 0) {
        const filePaths = files.map((file) => file.fileUrl);
        await this.deleteCoursesFilesFromStorage(filePaths);
        await this.deleteCourseFileFromDatabase(courseId);
      }
    }
  }

  private async getCoursesFilesByCourseIds(courseId: string): Promise<{ fileUrl: string }[]> {
    const { data, error } = await this.supabase.from('course_files').select('file_url').eq('course_id', courseId);

    if (error) {
      console.error('An error occurred while getting the courses files by course id: ', courseId, error);
      throw new ServerError(error.message);
    }

    return courseFileMapper.fileUrlsToDomain(data);
  }

  private async deleteCoursesFilesFromStorage(files: string[]): Promise<void> {
    const { error } = await this.supabase.storage.from('courses-pdf').remove(files);

    if (error) {
      console.error('An error occurred while deleting the courses files from storage: ', files, error);
      throw new ServerError(error.message);
    }
  }

  private async deleteCourseFileFromDatabase(courseId: string): Promise<void> {
    const { error } = await this.supabase.from('course_files').delete().eq('course_id', courseId);

    if (error) {
      console.error('Error deleting course files for course id: ', courseId, error);
      throw new ServerError(error.message);
    }
  }
}
