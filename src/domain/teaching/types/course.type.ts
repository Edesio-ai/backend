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
};
