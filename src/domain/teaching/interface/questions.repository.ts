import { Question } from '../types/question.type';

export const QUESTIONS_REPOSITORY = 'QUESTIONS_REPOSITORY';

export interface QuestionsRepository {
  deleteQuestionsByCourseIds(courseIds: string[]): Promise<void>;
  getPendingQuestionCount(courseIds: string[]): Promise<number>;
  getCourseQuestions(courseId: string): Promise<Question[]>;
}
