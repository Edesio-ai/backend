export type SelfLearnerQuestion = {
  id: string;
  courseId: string;
  type: 'single' | 'multiple' | 'open';
  questionText: string;
  proposals: string[];
  correctAnswers: string[];
  explanation: string;
  createdAt: Date;
};

export type SelfLearnerQuestionSupabase = {
  id: string;
  course_id: string;
  type: 'single' | 'multiple' | 'open';
  question_text: string;
  proposals: string[];
  correct_answers: string[];
  explanation: string;
  created_at: Date;
};

export type SelfLearnerQuestionInsert = Omit<SelfLearnerQuestion, 'id' | 'createdAt'>;

export type SelfLearnerQuestionInsertSupabase = Omit<SelfLearnerQuestionSupabase, 'id' | 'created_at'>;

export type UpdateSelfLearnerQuestionPayload = Pick<SelfLearnerQuestion, 'questionText' | 'correctAnswers'>;
export type SelfLearnerQuestionUpdateSupabase = Pick<SelfLearnerQuestionSupabase, 'question_text' | 'correct_answers'>;
