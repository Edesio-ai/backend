import {
  SessionStudent,
  StudentJoinedSession,
  StudentSession,
  StudentSessionStatus,
} from '../types/student-session.type';

export const STUDENT_SESSION_REPOSITORY = 'STUDENT_SESSION_REPOSITORY';

export interface IStudentSessionRepository {
  getStudentsSessionsByIds(sessionIds: string[]): Promise<StudentSession[]>;
  deleteStudentSessionsBySessionId(sessionId: string): Promise<void>;
  listSessionsEnrolledByStudent(studentId: string): Promise<StudentJoinedSession[]>;
  listStudentsEnrolledInSession(
    sessionId: string,
    select?: string,
    status?: StudentSessionStatus,
  ): Promise<SessionStudent[]>;
  getStudentSession(sessionId: string, studentId: string): Promise<StudentSession | null>;
  getStudentSessionMembership(sessionId: string, studentId: string): Promise<StudentSession | null>;
  createStudentSession(studentId: string, sessionId: string): Promise<void>;
  deleteStudentSession(sessionId: string, studentId: string): Promise<void>;
  banStudentFromSession(sessionId: string, studentId: string): Promise<void>;
  unbanStudentFromSession(sessionId: string, studentId: string): Promise<void>;
}
