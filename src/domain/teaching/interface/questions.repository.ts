import {
  CreateQuestionBody,
  GeneratedQuestion,
  Question,
  QuestionUpdate,
} from '../types/question.type';

export const QUESTIONS_REPOSITORY = 'QUESTIONS_REPOSITORY';

export interface QuestionsRepository {
  getQuestionById(questionId: string): Promise<Question>;
  deleteQuestionById(questionId: string): Promise<void>;
  insertQuestions(
    questions: GeneratedQuestion[],
    courseId: string,
  ): Promise<Question[]>;
  deleteQuestionsByCourseIds(courseIds: string[]): Promise<void>;
  getPendingQuestionCount(courseIds: string[]): Promise<number>;
  getCourseQuestions(courseId: string): Promise<Question[]>;
  deleteCourseQuizQuestions(courseId: string): Promise<void>;
  insertQuestion(question: CreateQuestionBody): Promise<Question>;
  updateQuestionById(
    questionId: string,
    updates: QuestionUpdate,
  ): Promise<Question>;
  deleteCourseQuestionsByCourseId(courseId: string): Promise<void>;
}
