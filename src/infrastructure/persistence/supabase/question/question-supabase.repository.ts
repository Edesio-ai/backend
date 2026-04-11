import { Inject } from '@nestjs/common';
import { QuestionsRepository } from 'src/domain/teaching/interface/questions.repository';
import { SUPABASE_ADMIN } from '../supabase.module';
import { QuestionServerError } from 'src/domain/teaching/error';

export class QuestionSupabaseRepository implements QuestionsRepository {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: any) {}

  async deleteQuestionsByCourseIds(courseIds: string[]): Promise<void> {
    const { data, error } = await this.supabase
      .from('questions')
      .delete()
      .in('course_id', courseIds);

    if (error) {
      throw new QuestionServerError(error.message);
    }

    return data;
  }
}
