import { TeacherWithStats } from '../teaching/teacher.type';

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
