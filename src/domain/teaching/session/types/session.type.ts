import { CourseFile } from '../../course-file/types/course-file.type';
import { CourseWithSession } from '../../course/types/course.type';
import { Question } from '../../question/types/question.type';
import { CourseRanking } from '../../student-course-stats/types/student-course-stats.type';

export type Language = 'francais' | 'anglais' | 'espagnol' | 'allemand';

export type SupabaseSessionCoursePendingQuestions = {
  pending_course_questions?: { count: number }[] | null;
};

export type SupabaseSession = {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  language: Language;
  created_at: string;
  sessions_student_count?: { count: number }[] | null;
  courses?: SupabaseSessionCoursePendingQuestions[] | null;
};

export type Session = {
  id: string;
  teacherId: string;
  name: string;
  code: string;
  language: Language;
  createdAt: string;
  studentCount: number;
  pendingQuestionCount: number;
};

export type CreateSessionInput = {
  name: string;
  code: string;
  language: Language;
};

export type CreateSessionBody = CreateSessionInput & {
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
