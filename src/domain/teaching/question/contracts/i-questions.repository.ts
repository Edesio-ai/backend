import { CreateQuestionBody, Question, QuestionUpdate } from '../types/question.type';
import { GeneratedQuestion } from 'src/domain/llm/types/openai.type';

export const QUESTIONS_REPOSITORY = 'QUESTIONS_REPOSITORY';

export interface IQuestionsRepository {
  getQuestionById(questionId: string): Promise<Question | null>;
  deleteQuestionById(questionId: string): Promise<void>;
  insertQuestions(questions: GeneratedQuestion[], courseId: string): Promise<Question[]>;
  deleteQuestionsByCourseIds(courseIds: string[]): Promise<void>;
  getCourseQuestions(courseId: string): Promise<Question[] | null>;
  deleteCourseQuizQuestions(courseId: string): Promise<void>;
  insertQuestion(question: CreateQuestionBody): Promise<Question>;
  updateQuestionById(questionId: string, updates: QuestionUpdate): Promise<Question>;
}
