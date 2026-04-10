import { Course } from 'src/domain/teaching/course.type';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface CourseRepository {
  getCoursesBySessionId(sessionId: string): Promise<Course[]>;
  deleteCoursesFilesByCourseIds(courseIds: string[]): Promise<void>;
  deleteCoursesBySessionId(sessionId: string): Promise<void>;
}
