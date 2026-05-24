import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';
import { selfLearnerQuestionMapper } from '../mappers/self-learner-question.mapper';

export class SelfLearnerQuestionRepository implements ISelfLearnerQuestionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
  ) {}

  public async deleteSelfLearnerQuestionsByCourseId(
    courseId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('self_learner_questions')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error(
        `Error deleting self learner questions by course id: ${courseId}`,
        error,
      );
      throw new ServerError(error.message);
    }
  }

  public async getSelfLearnerQuestions(
    courseId: string,
  ): Promise<SelfLearnerQuestion[]> {
    const { data, error } = await this.supabase
      .from('self_learner_questions')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(
        `Error getting self learner questions by course id: ${courseId}`,
        error,
      );
      throw new ServerError(error.message);
    }

    return data?.map(selfLearnerQuestionMapper.toDomain) ?? [];
  }
}
