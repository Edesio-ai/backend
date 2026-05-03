import {
  InsertStudent,
  SessionStudent,
  Student,
  StudentCourseStats,
  StudentJoinedSession,
  StudentSession,
  SupabaseSessionStudent,
  SupabaseStudent,
  SupabaseStudentCourseStats,
  SupabaseStudentInsert,
  SupabaseStudentJoinedSession,
  SupabaseStudentSession,
} from 'src/domain/teaching/types/student.type';

export const StudentMapper = {
  toDomain: (row: SupabaseStudent): Student => ({
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    photoUrl: row.photo_url,
  }),

  sessionToDomain: (row: SupabaseStudentSession): StudentSession => ({
    sessionId: row.session_id,
    studentId: row.student_id,
  }),

  courseStatToDomain: (
    row: SupabaseStudentCourseStats,
  ): StudentCourseStats => ({
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
  }),

  joinedSessionToDomain: (
    row: SupabaseStudentJoinedSession,
  ): StudentJoinedSession => ({
    id: row.sessions.id,
    teacherId: row.sessions.teacher_id,
    name: row.sessions.name,
    code: row.sessions.code,
    language: row.sessions.language,
    createdAt: row.sessions.created_at,
    joinedAt: row.joined_at,
  }),

  toInsert: (body: InsertStudent): SupabaseStudentInsert => ({
    supabase_user_id: body.supabaseUserId,
    name: body.name,
    email: body.email,
  }),

  studentSessionToDomain: (row: SupabaseSessionStudent): SessionStudent => {
    return {
      id: row.students.id,
      name: row.students.name,
      email: row.students.email,
      photoUrl: row.students.photo_url,
      joinedAt: row.joined_at,
    };
  },
};
