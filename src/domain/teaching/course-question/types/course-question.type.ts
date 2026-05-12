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

export type CourseQuestionToInsert = Pick<
  CourseQuestion,
  'courseId' | 'studentId' | 'questionText'
>;
export type SupabaseCourseQuestionToInsert = Pick<
  SupabaseCourseQuestion,
  'course_id' | 'student_id' | 'question_text'
>;
