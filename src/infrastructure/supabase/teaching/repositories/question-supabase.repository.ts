import { Inject } from '@nestjs/common';
import { QuestionsRepository } from 'src/domain/teaching/interface/questions.repository';
import { SUPABASE_ADMIN } from '../../supabase.module';
import {
  CreateQuestionBody,
  GeneratedQuestion,
  Question,
  QuestionUpdate,
} from 'src/domain/teaching/types/question.type';
import { QuestionMapper } from '../mappers/question.mapper';
import { CourseQuestion } from 'src/domain/teaching/types/course-question.type';
import { CourseQuestionMapper } from '../mappers/course-question.mapper';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
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
      throw new ServerError(error.message);
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
      throw new ServerError(countError.message);
    }

    return count ?? 0;
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

  public async deleteCourseQuestionsByCourseId(
    courseId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('course_questions')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'error deleting course questions by course id',
        courseId,
        error,
      );
      throw new ServerError(error.message);
    }
  }
  async getAnsweredQuestionCount(studentId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('course_questions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .not('answer', 'is', null);

    if (error) {
      console.error(
        'error getting answered question count for student id',
        studentId,
        error,
      );
      throw new ServerError(error.message);
    }

    return count ?? 0;
  }

  async getStudentCourseQuestions(courseId: string): Promise<CourseQuestion[]> {
    const { data, error } = await this.supabase
      .from('course_questions')
      .select('*')
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'error getting student course questions for course id',
        courseId,
        error,
      );
      throw new ServerError(error.message);
    }

    return data?.map(CourseQuestionMapper.toDomain) ?? [];
  }
}
