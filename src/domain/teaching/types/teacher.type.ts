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

export type TeacherWithStats = Teacher & {
  sessions_count: number;
  students_count: number;
  sessions: TeacherSession[];
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

export type TeacherSession = {
  id: string;
  name: string;
  code: string;
  language: string;
  teacherId: string;
  createdAt: string;
};
