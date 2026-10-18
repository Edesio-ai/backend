import { Session, SupabaseSession } from '../../session/types/session.type';
import { Student, SupabaseStudent } from '../../student/type/student.type';

export type StudentSessionStatus = 'active' | 'banned';

export type SupabaseStudentSession = {
  session_id: string;
  student_id: string;
  status?: StudentSessionStatus;
  banned_at?: string | null;
};

export type StudentSession = {
  sessionId: string;
  studentId: string;
  status: StudentSessionStatus;
  bannedAt: string | null;
};

export type SupabaseStudentJoinedSession = {
  joined_at: string;
  sessions: SupabaseSession | SupabaseSession[] | null;
};

export type StudentJoinedSession = Session & {
  joinedAt: string;
  teacherName: string;
};

export type SupabaseSessionStudent = {
  joined_at: string;
  banned_at?: string | null;
  status?: StudentSessionStatus;
  students: Omit<SupabaseStudent, 'created_at'>;
};

export type SessionStudent = Omit<Student, 'supabaseUserId' | 'createdAt'> & {
  joinedAt: string;
  supabaseUserId?: string;
  bannedAt?: string | null;
};

export type SessionStudentWithStats = SessionStudent & {
  attemptedQuestions: number;
  correctAnswers: number;
  successRate: number;
  lastAttemptAt: string | null;
};

export type BannedSessionStudent = SessionStudentWithStats & {
  bannedAt: string;
};

export type SessionStudentsPayload = {
  students: SessionStudentWithStats[];
  bannedStudents: BannedSessionStudent[];
};
