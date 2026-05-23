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
  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
  ) {}

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
}
