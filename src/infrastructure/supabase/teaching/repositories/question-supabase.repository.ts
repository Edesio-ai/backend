import { Inject } from '@nestjs/common';
import { QuestionsRepository } from 'src/domain/teaching/interface/questions.repository';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { QuestionServerError } from 'src/domain/teaching/error';

export class QuestionSupabaseRepository implements QuestionsRepository {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: any) {}

  async deleteQuestionsByCourseIds(courseIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .in('course_id', courseIds);

    if (error) {
      console.error(
        'error deleting questions by course ids for course ids',
        courseIds,
        error,
      );
      throw new QuestionServerError(error.message);
    }
  }

  async getPendingQuestionCount(courseIds: string[]): Promise<number> {
    const { count, error: countError } = await this.supabase
      .from('course_questions')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .is('answer', null);

    if (countError) {
      console.error(
        'error getting pending question count for course ids',
        courseIds,
        countError,
      );
      throw new QuestionServerError(countError.message);
    }

    return count ?? 0;
  }
}
