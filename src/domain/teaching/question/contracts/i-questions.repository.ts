import {
  CreateQuestionBody,
  GeneratedQuestion,
  Question,
  QuestionUpdate,
} from '../types/question.type';

export const QUESTIONS_REPOSITORY = 'QUESTIONS_REPOSITORY';

export interface IQuestionsRepository {
  getQuestionById(questionId: string): Promise<Question>;
  deleteQuestionById(questionId: string): Promise<void>;
  insertQuestions(
    questions: GeneratedQuestion[],
    courseId: string,
  ): Promise<Question[]>;
  deleteQuestionsByCourseIds(courseIds: string[]): Promise<void>;
  getCourseQuestions(courseId: string): Promise<Question[]>;
  deleteCourseQuizQuestions(courseId: string): Promise<void>;
  insertQuestion(question: CreateQuestionBody): Promise<Question>;
  updateQuestionById(
    questionId: string,
    updates: QuestionUpdate,
  ): Promise<Question>;
}
