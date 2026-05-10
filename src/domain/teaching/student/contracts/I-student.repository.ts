import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { Student } from '../type/student.type';

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

export interface IStudentRepository {
  getStudentsByIds(studentIds: string[]): Promise<Student[]>;
  getStudentByUserId(userId: string): Promise<Student | null>;
  createStudent(user: AuthUser): Promise<Student>;
  storeStudentPhoto(buffer: Buffer, storagePath: string): Promise<string>;
  updateStudentPhoto(studentId: string, photoUrl: string): Promise<void>;
}
