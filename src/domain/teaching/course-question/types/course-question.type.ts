export type CourseQuestion = {
  id: string;
  courseId: string;
  studentId: string;
  questionText: string;
  answer: string;
  createdAt: string;
  answeredAt: string;
};

export type SupabaseCourseQuestion = {
  id: string;
  course_id: string;
  student_id: string;
  question_text: string;
  answer: string;
  created_at: string;
  answered_at: string;
};
