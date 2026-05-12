import { CourseFile } from '../../course-file/types/course-file.type';
import { Question } from '../../question/types/question.type';
import { Session, SupabaseSession } from '../../session/types/session.type';
import { SupabaseTeacher, Teacher } from '../../teacher/types/teacher.type';

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

export type SupabaseCourseWithSession = {
  id: string;
  title: string;
  description: string | null;
  text_content: string | null;
  validated_questions?: boolean;
  position_order?: number;
  sessions: Partial<SupabaseSession & { teachers: Partial<SupabaseTeacher> }>;
};

export type CourseWithSession = Partial<Course> & {
  id: string;
  session: Partial<Session>;
  teachers: Partial<Teacher>;
};

export type SupabaseCourseInsert = {
  session_id: string;
  title: string;
  description?: string | null;
  text_content?: string | null;
};
