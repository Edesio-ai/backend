import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';

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
}
