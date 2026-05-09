import { AuthUser } from 'src/domain/auth/types/auth.type';
import type {
  Student,
  StudentCourseStatsWithStudent,
  StudentJoinedSession,
  StudentSession,
  SessionStudent,
  StudentCourseStats,
  UpdateStudentCourseStats,
  insertStudentCourseStats,
} from '../types/student.type';

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

export interface StudentRepository {
  getStudentsByIds(studentIds: string[]): Promise<Student[]>;
  createStudentSession(studentId: string, sessionId: string): Promise<void>;
  getStudentJoinedSessions(studentId: string): Promise<StudentJoinedSession[]>;
  getStudentByUserId(userId: string): Promise<Student | null>;
  getStudentsSessionsByIds(sessionIds: string[]): Promise<StudentSession[]>;
  getStudentSessionsBySessionId(
    sessionId: string,
    select: string,
  ): Promise<SessionStudent[]>;
  deleteStudentSessionsBySessionId(sessionId: string): Promise<void>;
  getStudentStatsByCourseId(
    courseId: string,
  ): Promise<StudentCourseStatsWithStudent[]>;
  deleteStudentCourseStatsByCourseId(courseId: string): Promise<void>;
  createStudent(user: AuthUser): Promise<Student>;
  storeStudentPhoto(buffer: Buffer, storagePath: string): Promise<string>;
  updateStudentPhoto(studentId: string, photoUrl: string): Promise<void>;
  getStudentSessionBySessionId(
    sessionId: string,
  ): Promise<StudentSession | null>;
  deleteStudentSession(sessionId: string, studentId: string): Promise<void>;
  getStudentCourseStatsByStudentIdAndCourseId(
    studentId: string,
    courseId: string,
  ): Promise<StudentCourseStats | null>;
  createStudentCourseStats(
    statToInsert: insertStudentCourseStats,
  ): Promise<void>;
  updateStudentCourseStats(
    statId: string,
    statToUpdate: UpdateStudentCourseStats,
  ): Promise<void>;
}
