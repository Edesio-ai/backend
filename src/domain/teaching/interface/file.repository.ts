import { CourseFile } from '../types/course.type';

export const FILE_REPOSITORY = Symbol('FILE_REPOSITORY');

export interface FileRepository {
  deleteFileById(fileId: string): Promise<void>;
  getCourseFileById(fileId: string): Promise<CourseFile>;
}
