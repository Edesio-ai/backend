import { TeacherWithStats } from '../../teacher/types/teacher.type';

export type CreateEstablishmentBody = {
  supabaseUserId: string;
  name: string;
  email: string;
};

export type Establishment = {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: string;
};

export type EstablishmentStats = {
  establishment: Establishment;
  teachers: TeacherWithStats[];
  stats: Stats;
};

export type Stats = {
  totalTeachers: number;
  totalSessions: number;
  totalStudents: number;
};

export type SupabaseEstablishment = {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  created_at: string;
};
