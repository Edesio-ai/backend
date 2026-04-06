export type Teacher = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  establishment_id: string;
  available_chatbots: number;
  supabase_user_id?: string;
};

export type TeacherWithStats = Teacher & {
  sessions_count: number;
  students_count: number;
  sessions: TeacherSession[];
};

export type TeacherSession = {
  id: string;
  name: string;
  code: string;
  language: string;
  teacher_id: string;
  created_at: string;
};
