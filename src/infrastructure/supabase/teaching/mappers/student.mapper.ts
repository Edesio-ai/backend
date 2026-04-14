import {
  StudentCourseStats,
  StudentSession,
  SupabaseStudentCourseStats,
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

export function supabaseStudentCourseStatsToStudentCourseStats(
  rows: SupabaseStudentCourseStats[],
): StudentCourseStats[] {
  return rows.map((row) => ({
    studentId: row.student_id,
    attemptedQuestions: row.attempted_questions,
    correctAnswers: row.correct_answers,
    lastAttemptAt: row.last_attempt_at,
    student: {
      name: row.students.name,
      photoUrl: row.students.photo_url,
    },
  }));
}
