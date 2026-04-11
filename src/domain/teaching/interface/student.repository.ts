export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

export interface StudentRepository {
  getStudentsSessionsByIds(sessionIds: string[]): Promise<any>;
  deleteStudentSessionsBySessionId(sessionId: string): Promise<void>;
}
