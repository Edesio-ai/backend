import { SupabaseCourse, CreateCourseBody, Course, CourseWithSession } from '../types/course.type';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface ICourseRepository {
  getCourseById(courseId: string): Promise<Course | null>;
  getCourseWithSessionById(courseId: string, select: string): Promise<CourseWithSession | null>;
  getSessionCoursesBySessionId(sessionId: string): Promise<Course[]>;
  getCoursesBySessionId(sessionId: string): Promise<SupabaseCourse[]>;
  deleteCoursesBySessionId(sessionId: string): Promise<void>;
  getSessionCoursesCount(sessionId: string): Promise<number>;
  createCourse(body: CreateCourseBody): Promise<Course>;
  getCourseValidatedQuestions(courseId: string): Promise<{ validatedQuestions: boolean }>;
  deleteCourseById(courseId: string): Promise<void>;
  updateCourse(courseId: string, updates: Record<string, unknown>): Promise<Course>;
}
