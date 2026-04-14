/** Row from Supabase `student_sessions` (junction). */
export type SupabaseStudentSession = {
  session_id: string;
  student_id: string;
};

export type StudentSession = {
  sessionId: string;
  studentId: string;
};

export type SupabaseStudentCourseStats = {
  student_id: string;
  attempted_questions: number;
  correct_answers: number;
  last_attempt_at: string;
  students: {
    name: string;
    photo_url: string;
  };
};

export type StudentCourseStats = {
  studentId: string;
  attemptedQuestions: number;
  correctAnswers: number;
  lastAttemptAt: string;
  student: {
    name: string;
    photoUrl: string;
  };
};
