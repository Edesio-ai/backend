export type SelfLearnerCourseFile = {
  id: string;
  courseId: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
};

export type SelfLearnerCourseFileSupabase = {
  id: string;
  course_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
};
export type SelfLearnerCourseFileInsertPayload = Omit<SelfLearnerCourseFile, 'id' | 'createdAt'>;

export type SelfLearnerCourseFileInsertPayloadSupabase = Omit<SelfLearnerCourseFileSupabase, 'id' | 'created_at'>;
