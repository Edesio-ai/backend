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
