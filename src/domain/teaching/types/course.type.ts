import { Question } from './question.type';
import { Session, SupabaseSession } from './session.type';
import { SupabaseTeacher, Teacher } from './teacher.type';

export type SupabaseCourse = {
  id: string;
  session_id: string;
  title: string;
  description: string | null;
  text_content: string | null;
  validated_questions?: boolean;
  position_order?: number;
  created_at: string;
};

export type CreateCourseBody = {
  sessionId: string;
  title: string;
  description?: string | null;
  contentText?: string | null;
};

export type SupabaseCourseFile = {
  id: string;
  course_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
};

export type CourseFile = {
  id: string;
  courseId: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
};

export type CourseFileUpload = {
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
  byteLength: number;
};

export type Course = {
  id: string;
  sessionId: string;
  title: string;
  description: string | null;
  contentText?: string | null;
  validatedQuestions?: boolean;
  positionOrder?: number;
  createdAt?: string;
};

export type Language = 'francais' | 'anglais' | 'espagnol' | 'allemand';

export type SupabaseCourseWithSession = {
  id: string;
  title: string;
  description: string | null;
  content_text: string | null;
  validated_questions?: boolean;
  position_order?: number;
  sessions: Partial<SupabaseSession & { teachers: Partial<SupabaseTeacher> }>;
};

export type CourseWithSession = Partial<Course> & {
  session: Partial<Session>;
  teachers: Partial<Teacher>;
};

export type CourseRanking = {
  studentId: string;
  name: string;
  photoUrl: string | null;
  attemptedQuestions: number;
  correctAnswers: number;
  successRate: number;
  rank: number;
  lastAttempt: string;
};

export type CourseRankingWithRate = Omit<CourseRanking, 'rank'>;

export type CourseDetails = {
  course: Partial<CourseWithSession>;
  questions: Partial<Question>[];
  students: Partial<CourseRanking>[];
  files: Partial<CourseFile>[];
};
