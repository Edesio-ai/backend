import { CourseFile } from '../../course-file/types/course-file.type';
import { CourseWithSession } from '../../course/types/course.type';
import { Question } from '../../question/types/question.type';
import { CourseRanking } from '../../student-course-stats/types/student-course-stats.type';

export type Language = 'francais' | 'anglais' | 'espagnol' | 'allemand';

export type SupabaseSession = {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  language: Language;
  created_at: string;
};

export type Session = {
  id: string;
  teacherId: string;
  name: string;
  code: string;
  language: Language;
  createdAt: string;
};

export type CreateSessionBody = {
  name: string;
  code: string;
  language: Language;
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

export type SessionDetails = {
  course: Partial<CourseWithSession>;
  questions: Partial<Question>[];
  students: Partial<CourseRanking>[];
  files: Partial<CourseFile>[];
};
