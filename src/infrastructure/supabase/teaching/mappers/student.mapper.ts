import {
  InsertStudent,
  Student,
  StudentCourseStats,
  StudentSession,
  SupabaseStudent,
  SupabaseStudentCourseStats,
  SupabaseStudentInsert,
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
      id: row.students.id,
      name: row.students.name,
      photoUrl: row.students.photo_url,
      email: row.students.email,
    },
  }));
}

export function supabaseStudentToStudent(row: SupabaseStudent): Student {
  return {
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    photoUrl: row.photo_url,
  };
}

export function insertStudentToSupabaseStudentInsert(
  body: InsertStudent,
): SupabaseStudentInsert {
  return {
    supabase_user_id: body.supabaseUserId,
    name: body.name,
    email: body.email,
  };
}
