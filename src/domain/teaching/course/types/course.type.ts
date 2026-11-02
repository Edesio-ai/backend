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
  questions?: { count: number }[] | null;
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
  questionCount?: number;
  /** Class average 0–100, or null when nobody has attempted the course yet. */
  averageSuccessRate?: number | null;
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
  validated_questions?: boolean;
};

/** Question shape for course details — matches frontend `Question` (non-null proposals). */
export type CourseDetailsQuestion = {
  id: string;
  courseId: string;
  type: Question['type'];
  questionText: string;
  proposals: string[];
  correctAnswers: string[] | null;
  explanation: string | null;
  createdAt: string;
  positionOrder: number | null;
  cheatingDetectionEnabled: boolean;
};

export type CourseDetails = {
  course: Course & {
    contentText: string | null;
    createdAt: string;
  };
  studentsCount: number;
  /** Session students who attempted at least one question on this course (chatbot usage). */
  studentsWhoUsedChatbotCount: number;
  /** Null when no enrolled student has attempted the course. */
  averageSuccessRate: number | null;
  files: CourseFile[];
  questions: CourseDetailsQuestion[];
};
