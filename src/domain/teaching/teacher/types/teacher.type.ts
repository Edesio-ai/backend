import { Session } from '../../session/types/session.type';

export type UpdateTeacherPayload = Pick<Teacher, 'name' | 'email'>;

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
  photoUrl: string | null;
};
