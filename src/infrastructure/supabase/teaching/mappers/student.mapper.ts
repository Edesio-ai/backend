import {
  StudentSession,
  SupabaseStudentSession,
} from 'src/domain/teaching/types/student.type';

export function supabaseStudentSessionToStudentSession(
  row: SupabaseStudentSession,
): StudentSession {
  return {
    sessionId: row.session_id,
    studentId: row.student_id,
  };
}

export function supabaseStudentSessionsToStudentSessions(
  rows: SupabaseStudentSession[],
): StudentSession[] {
  return rows.map(supabaseStudentSessionToStudentSession);
}
