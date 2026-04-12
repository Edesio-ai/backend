import {
  SupabaseCourse,
  SupabaseCourseFile,
  CourseFileUpload,
  CreateCourseBody,
  Course,
  CourseFile,
} from '../types/course.type';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface CourseRepository {
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
}
