export type SessionLanguage = 'francais' | 'anglais' | 'espagnol' | 'allemand';

/** Row returned by Supabase for `public.sessions` (snake_case columns). */
export type SupabaseSession = {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  language: SessionLanguage;
  created_at: string;
};

export type Session = {
  id: string;
  teacherId: string;
  name: string;
  code: string;
  language: SessionLanguage;
  createdAt: string;
};

export type CreateSessionBody = {
  name: string;
  code: string;
  language: SessionLanguage;
  teacherId: string;
};

export type UpdateSessionNameBody = {
  name: string;
  teacherId: string;
};

export type SupabaseSessionInsert = {
  teacher_id: string;
  name: string;
  code: string;
  language: string;
};
