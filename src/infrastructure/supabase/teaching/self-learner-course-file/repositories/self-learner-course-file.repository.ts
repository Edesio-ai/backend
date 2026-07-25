import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from 'src/domain/shared/errors/global.errors';

import { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';
import { selfLearnerCourseFileMapper } from '../mappers/self-learner-course-file.mapper';
import {
  SelfLearnerCourseFile,
  SelfLearnerCourseFileInsertPayload,
} from 'src/domain/teaching/self-learner-course-file/types/self-learner-course-file.type';

export class SelfLearnerCourseFileRepository implements ISelfLearnerCourseFileRepository {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  public async uploadSelfLearnerCourseFile(
    payload: SelfLearnerCourseFileInsertPayload,
  ): Promise<SelfLearnerCourseFile> {
    const { error, data } = await this.supabase
      .from('self_learner_course_files')
      .insert(selfLearnerCourseFileMapper.toInsert(payload))
      .select()
      .single();

    if (error) {
      throw new ServerError(error.message);
    }

    return selfLearnerCourseFileMapper.toDomain(data);
  }

  public async getSelfLearnerCourseFiles(courseId: string): Promise<SelfLearnerCourseFile[]> {
    const { data, error } = await this.supabase
      .from('self_learner_course_files')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error getting self learner course files for course ${courseId}: ${error.message}`);
      throw new ServerError(error.message);
    }
    return data ? data.map((row) => selfLearnerCourseFileMapper.toDomain(row)) : [];
  }

  public async getSelfLearnerCourseFilesUrls(courseId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('self_learner_course_files')
      .select('file_url')
      .eq('course_id', courseId);

    if (error) {
      console.error(`Error getting self learner course files urls for course ${courseId}: ${error.message}`);
      throw new ServerError(error.message);
    }
    return data ? selfLearnerCourseFileMapper.toCourseFilesUrls(data) : [];
  }

  public async deleteSelfLearnerCourseFilesByCourseId(courseId: string): Promise<void> {
    const { error } = await this.supabase.from('self_learner_course_files').delete().eq('course_id', courseId);

    if (error) {
      console.error(`Error deleting self learner course files by course id: ${courseId}: ${error.message}`);
      throw new ServerError(error.message);
    }
  }

  public async getSelfLearnerCourseFileById(fileId: string): Promise<SelfLearnerCourseFile> {
    const { data, error } = await this.supabase.from('self_learner_course_files').select('*').eq('id', fileId).single();

    if (error) {
      console.error(`Error getting self learner course file by id: ${fileId}: ${error.message}`);
      throw new ServerError(error.message);
    }
    return selfLearnerCourseFileMapper.toDomain(data);
  }

  public async deleteSelfLearnerCourseFileById(fileId: string): Promise<void> {
    const { error } = await this.supabase.from('self_learner_course_files').delete().eq('id', fileId);

    if (error) {
      console.error(`Error deleting self learner course file by id: ${fileId}: ${error.message}`);
      throw new ServerError(error.message);
    }
  }

  public async getSelfLearnerCourseFileSignedUrl(fileUrl: string): Promise<string | null> {
    const { data, error } = await this.supabase.storage.from('courses-pdf').createSignedUrl(fileUrl, 3600);

    if (error) {
      console.error(`Error getting self learner course file signed url: ${fileUrl}: ${error.message}`);
      throw new ServerError(error.message);
    }

    return data.signedUrl ?? null;
  }
}
