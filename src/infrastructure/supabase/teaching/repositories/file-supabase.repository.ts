import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { FileRepository } from 'src/domain/teaching/interface/file.repository';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { CourseFile } from 'src/domain/teaching/types/course.type';
import { supabaseCourseFileToCourseFile } from '../mappers/file.mapper';

export class FileSupabaseRepository implements FileRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  public async deleteFileById(fileId: string): Promise<void> {
    const file = await this.getCourseFileById(fileId);
    await this.deleteFileFromStorage(file.fileUrl);

    const { error } = await this.supabase
      .from('course_files')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error(`Error deleting file from database: ${fileId}`, error);
      throw new ServerError(error.message);
    }
  }

  private async deleteFileFromStorage(fileUrl: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from('courses-pdf')
      .remove([fileUrl]);

    if (error) {
      console.error(`Error deleting file from storage: ${fileUrl}`, error);
      throw new ServerError(error.message);
    }
  }

  private async getCourseFileById(fileId: string): Promise<CourseFile> {
    const { data, error } = await this.supabase
      .from('course_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) {
      console.error(`Error getting course file by id: ${fileId}`, error);
      throw new ServerError(error.message);
    }

    return supabaseCourseFileToCourseFile(data);
  }
}
