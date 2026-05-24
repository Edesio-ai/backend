export type SelfLearnerQuestion = {
  id: string;
  courseId: string;
  type: 'single' | 'multiple' | 'open';
  questionText: string;
  proposals: string[];
  correctAnswer: string[];
  explanation: string;
  createdAt: Date;
};

export type SelfLearnerQuestionSupabase = {
  id: string;
  course_id: string;
  type: 'single' | 'multiple' | 'open';
  question_text: string;
  proposals: string[];
  correct_answer: string[];
  explanation: string;
  created_at: Date;
};
