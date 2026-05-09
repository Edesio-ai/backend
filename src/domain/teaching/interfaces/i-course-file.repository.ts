import { CourseFile, CourseFileUpload } from '../types/course.type';

export const COURSE_FILE_REPOSITORY = Symbol('COURSE_FILE_REPOSITORY');

export interface ICourseFileRepository {
  getFileBufferFromStorage(filePath: string): Promise<Buffer>;
  getCourseFilesByCourseId(courseId: string): Promise<CourseFile[]>;
  insertCourseFile(
    courseId: string,
    file: CourseFileUpload,
    storagePath: string,
  ): Promise<CourseFile>;
  deleteCoursesFilesByCourseIds(courseIds: string[]): Promise<void>;
  storeCourseFile(file: CourseFileUpload, storagePath: string): Promise<void>;
}
