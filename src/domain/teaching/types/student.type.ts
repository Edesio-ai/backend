import { Session, SupabaseSession } from './session.type';

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
    id: string;
    email: string;
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
    id: string;
    email: string;
    name: string;
    photoUrl: string;
  };
};

export type Student = {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: string;
  photoUrl: string;
};

export type SupabaseStudent = {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  created_at: string;
  photo_url: string;
};

export type InsertStudent = Omit<Student, 'id' | 'createdAt' | 'photoUrl'>;
export type SupabaseStudentInsert = Omit<
  SupabaseStudent,
  'id' | 'created_at' | 'photo_url'
>;

export type SupabaseStudentJoinedSession = {
  joined_at: string;
  sessions: SupabaseSession;
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

export type StudentPhotoUpload = {
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
  byteLength: number;
};
