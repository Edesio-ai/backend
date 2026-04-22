import {
  CreateQuestionBody,
  GeneratedQuestion,
  Question,
} from '../types/question.type';

export const QUESTIONS_REPOSITORY = 'QUESTIONS_REPOSITORY';

export interface QuestionsRepository {
  insertQuestions(
    questions: GeneratedQuestion[],
    courseId: string,
  ): Promise<Question[]>;
  deleteQuestionsByCourseIds(courseIds: string[]): Promise<void>;
  getPendingQuestionCount(courseIds: string[]): Promise<number>;
  getCourseQuestions(courseId: string): Promise<Question[]>;
  deleteCourseQuestions(courseId: string): Promise<void>;
  insertQuestion(question: CreateQuestionBody): Promise<Question>;
}
