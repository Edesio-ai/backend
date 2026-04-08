export interface Session {
  id: string;
  teacher_id: string;
  nom: string;
  code: string;
  langue: SessionLanguage;
  created_at: string;
}

export type SessionLanguage = 'francais' | 'anglais' | 'espagnol' | 'allemand';
