import { CourseFile } from '../../teaching/course/types/course.type';

export const FILE_REPOSITORY = Symbol('FILE_REPOSITORY');

export interface FileRepository {
  deleteFileById(fileId: string): Promise<void>;
  getCourseFileById(fileId: string, select?: string): Promise<CourseFile>;
  getCourseFilesByCourseId(courseId: string): Promise<CourseFile[]>;
}
