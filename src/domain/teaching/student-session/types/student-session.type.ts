import { Session, SupabaseSession } from '../../session/types/session.type';
import { Student, SupabaseStudent } from '../../student/type/student.type';

export type SupabaseStudentSession = {
  session_id: string;
  student_id: string;
};

export type StudentSession = {
  sessionId: string;
  studentId: string;
};

export type SupabaseStudentJoinedSession = {
  joined_at: string;
  sessions: SupabaseSession | SupabaseSession[] | null;
};

export type StudentJoinedSession = Session & {
  joinedAt: string;
};

export type SupabaseSessionStudent = {
  joined_at: string;
  students: Omit<SupabaseStudent, 'supabase_user_id' | 'created_at'>;
};

export type SessionStudent = Omit<Student, 'supabaseUserId' | 'createdAt'> & {
  joinedAt: string;
};

export type SessionStudentWithStats = SessionStudent & {
  attemptedQuestions: number;
  correctAnswers: number;
  successRate: number;
  lastAttemptAt: string | null;
};
