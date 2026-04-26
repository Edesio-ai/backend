import type { StudentCourseStats, StudentSession } from '../types/student.type';

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

export interface StudentRepository {
  getStudentsSessionsByIds(sessionIds: string[]): Promise<StudentSession[]>;
  deleteStudentSessionsBySessionId(sessionId: string): Promise<void>;
  getStudentStatsByCourseId(courseId: string): Promise<StudentCourseStats[]>;
  deleteStudentCourseStatsByCourseId(courseId: string): Promise<void>;
}
