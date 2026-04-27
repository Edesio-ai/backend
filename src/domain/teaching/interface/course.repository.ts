import {
  SupabaseCourse,
  CourseFileUpload,
  CreateCourseBody,
  Course,
  CourseFile,
  CourseWithSession,
} from '../types/course.type';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface CourseRepository {
  getCourseById(courseId: string): Promise<Course>;
  getCourseWithSessionById(
    courseId: string,
    select: string,
  ): Promise<CourseWithSession>;
  getSessionCoursesBySessionId(sessionId: string): Promise<Course[]>;
  getCoursesBySessionId(sessionId: string): Promise<SupabaseCourse[]>;
  deleteCoursesFilesByCourseIds(courseIds: string[]): Promise<void>;
  deleteCoursesBySessionId(sessionId: string): Promise<void>;
  getSessionCoursesCount(sessionId: string): Promise<number>;
  createCourse(body: CreateCourseBody): Promise<Course>;
  storeCourseFile(file: CourseFileUpload, storagePath: string): Promise<void>;
  insertCourseFile(
    courseId: string,
    file: CourseFileUpload,
    storagePath: string,
  ): Promise<CourseFile>;
  getCourseValidatedQuestions(
    courseId: string,
  ): Promise<{ validatedQuestions: boolean }>;
  getCourseFilesByCourseId(courseId: string): Promise<CourseFile[]>;
  getFileBufferFromStorage(filePath: string): Promise<Buffer>;
  deleteCourseById(courseId: string): Promise<void>;
  updateCourse(
    courseId: string,
    updates: Record<string, unknown>,
  ): Promise<Course>;
}
