/** Row from Supabase `student_sessions` (junction). */
export type SupabaseStudentSession = {
  session_id: string;
  student_id: string;
};

export type StudentSession = {
  sessionId: string;
  studentId: string;
};
