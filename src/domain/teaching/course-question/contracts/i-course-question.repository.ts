import { CourseQuestion } from '../types/course-question.type';

export const COURSE_QUESTION_REPOSITORY = Symbol('COURSE_QUESTION_REPOSITORY');

export interface ICourseQuestionRepository {
  getPendingQuestionCount(courseIds: string[]): Promise<number>;
  deleteCourseQuestionsByCourseId(courseId: string): Promise<void>;
  getAnsweredQuestionCount(userId: string): Promise<number>;
  getCourseQuestionsByCourseId(courseId: string): Promise<CourseQuestion[]>;
}
