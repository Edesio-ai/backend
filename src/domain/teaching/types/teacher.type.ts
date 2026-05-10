/** Row from Supabase `public.teachers`. */
export type SupabaseTeacher = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  establishment_id: string | null;
  available_chatbots: number;
  supabase_user_id?: string | null;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  establishmentId: string | null;
  availableChatbots: number;
  supabaseUserId?: string | null;
};

export type SupabaseTeacherInsert = {
  supabase_user_id: string;
  name: string;
  email: string;
  establishment_id?: string | null;
  available_chatbots?: number;
};

export type TeacherWithStats = Teacher & {
  sessionsCount: number;
  studentsCount: number;
  sessions: Session[];
};

/** Row from Supabase `sessions` when joined to teachers context. */
export type SupabaseTeacherSession = {
  id: string;
  name: string;
  code: string;
  language: string;
  teacher_id: string;
  created_at: string;
};

export type Session = {
  id: string;
  name: string;
  code: string;
  language: string;
  teacherId: string;
  createdAt: string;
};
