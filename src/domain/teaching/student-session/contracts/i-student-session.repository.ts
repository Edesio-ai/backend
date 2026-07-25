import { SessionStudent, StudentJoinedSession, StudentSession } from '../types/student-session.type';

export const STUDENT_SESSION_REPOSITORY = 'STUDENT_SESSION_REPOSITORY';

export interface IStudentSessionRepository {
  getStudentsSessionsByIds(sessionIds: string[]): Promise<StudentSession[]>;
  deleteStudentSessionsBySessionId(sessionId: string): Promise<void>;
  listSessionsEnrolledByStudent(studentId: string): Promise<StudentJoinedSession[]>;
  listStudentsEnrolledInSession(sessionId: string, select: string): Promise<SessionStudent[]>;
  getStudentSessionBySessionId(sessionId: string): Promise<StudentSession | null>;
  createStudentSession(studentId: string, sessionId: string): Promise<void>;
  deleteStudentSession(sessionId: string, studentId: string): Promise<void>;
}
