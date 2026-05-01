import { AuthUser } from 'src/domain/auth/types/auth.type';
import type {
  Student,
  StudentCourseStats,
  StudentJoinedSession,
  StudentSession,
} from '../types/student.type';

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

export interface StudentRepository {
  createStudentSession(studentId: string, sessionId: string): Promise<void>;
  getStudentJoinedSessions(studentId: string): Promise<StudentJoinedSession[]>;
  getStudentByUserId(userId: string): Promise<Student | null>;
  getStudentsSessionsByIds(sessionIds: string[]): Promise<StudentSession[]>;
  deleteStudentSessionsBySessionId(sessionId: string): Promise<void>;
  getStudentStatsByCourseId(courseId: string): Promise<StudentCourseStats[]>;
  deleteStudentCourseStatsByCourseId(courseId: string): Promise<void>;
  createStudent(user: AuthUser): Promise<Student>;
}
