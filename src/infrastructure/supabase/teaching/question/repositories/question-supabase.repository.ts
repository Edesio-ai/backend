import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../../../supabase.module';
import {
  CreateQuestionBody,
  GeneratedQuestion,
  Question,
  QuestionUpdate,
} from 'src/domain/teaching/question/types/question.type';
import { QuestionMapper } from '../mappers/question.mapper';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';

export class QuestionSupabaseRepository implements IQuestionsRepository {
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
      throw new ServerError(error.message);
    }
  }

  async getCourseQuestions(courseId: string): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(
        'error getting course questions for course id',
        courseId,
        error,
      );
      throw new ServerError(error.message);
    }

    return data?.map(QuestionMapper.toDomain) ?? [];
  }

  async insertQuestions(
    questions: GeneratedQuestion[],
    courseId: string,
  ): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .insert(QuestionMapper.generatedToInserts(questions, courseId))
      .select();

    if (error) {
      console.error('error inserting questions for course id', courseId, error);
      throw new ServerError(error.message);
    }

    return data?.map(QuestionMapper.toDomain) ?? [];
  }

  async deleteCourseQuizQuestions(courseId: string): Promise<void> {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'error deleting course questions for course id',
        courseId,
        error,
      );
      throw new ServerError(error.message);
    }
  }

  async insertQuestion(question: CreateQuestionBody): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questions')
      .insert(QuestionMapper.toInsert(question))
      .select()
      .single();

    if (error) {
      console.error('error inserting question', question, error);
      throw new ServerError(error.message);
    }

    return QuestionMapper.toDomain(data);
  }

  public async getQuestionById(questionId: string): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) {
      console.error('error getting question by id', questionId, error);
      throw new ServerError(error.message);
    }

    return QuestionMapper.toDomain(data);
  }

  async deleteQuestionById(questionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.error('error deleting question by id', questionId, error);
      throw new ServerError(error.message);
    }
  }

  async updateQuestionById(
    questionId: string,
    updates: QuestionUpdate,
  ): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questions')
      .update(QuestionMapper.toUpdate(updates))
      .eq('id', questionId)
      .select()
      .single();

    if (error) {
      console.error(
        'error updating question by id',
        questionId,
        updates,
        error,
      );
      throw new ServerError(error.message);
    }

    return QuestionMapper.toDomain(data);
  }
}
