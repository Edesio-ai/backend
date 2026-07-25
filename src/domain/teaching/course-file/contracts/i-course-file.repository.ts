import { CourseFile, CourseFileUpload } from '../types/course-file.type';

export const COURSE_FILE_REPOSITORY = Symbol('COURSE_FILE_REPOSITORY');

export interface ICourseFileRepository {
  deleteFileFromStorage(fileUrl: string): Promise<void>;
  getFileBufferFromStorage(filePath: string): Promise<Buffer | null>;
  getCourseFilesByCourseId(courseId: string): Promise<CourseFile[]>;
  insertCourseFile(courseId: string, file: CourseFileUpload, storagePath: string): Promise<CourseFile>;
  deleteCoursesFilesByCourseIds(courseIds: string[]): Promise<void>;
  storeCourseFile(file: CourseFileUpload, storagePath: string): Promise<void>;
  deleteFileById(fileId: string): Promise<void>;
  getCourseFileById(fileId: string, select?: string): Promise<CourseFile | null>;
}
