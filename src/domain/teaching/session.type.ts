export type Session = {
  id: string;
  teacher_id: string;
  nom: string;
  code: string;
  langue: SessionLanguage;
  created_at: string;
};

export type SessionLanguage = 'francais' | 'anglais' | 'espagnol' | 'allemand';

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
