import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';
import { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import { SelfLearnerCourse } from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SelfLearnerCourseMapper } from '../mappers/self-learner-course.use-case';

export class SelfLearnerCourseRepository implements ISelfLearnerCourseRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  async getSelfLearnerCourses(
    selfLearnerId: string,
  ): Promise<SelfLearnerCourse[]> {
    const { data, error } = await this.supabase
      .from('self_learner_courses')
      .select('*')
      .eq('self_learner_id', selfLearnerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        `Error getting self learner courses for self learner ${selfLearnerId}: ${error.message}`,
      );
      throw new ServerError(error.message);
    }

    return data ? data.map((row) => SelfLearnerCourseMapper.toDomain(row)) : [];
  }
}
