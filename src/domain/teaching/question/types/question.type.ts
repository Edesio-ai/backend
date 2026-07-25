export type QuestionType = 'single' | 'multiple' | 'open';

export type SupabaseQuestion = {
  id: string;
  course_id: string;
  type: QuestionType;
  question_text: string;
  proposals: unknown[] | null;
  correct_answers: string[] | null;
  explanation: string | null;
  created_at: string;
  position_order: number | null;
};

export type Question = {
  id: string;
  courseId: string;
  type: QuestionType;
  questionText: string;
  proposals: unknown[] | null;
  correctAnswers: string[] | null;
  explanation: string | null;
  createdAt: string;
  positionOrder: number | null;
};

export type CreateQuestionBody = {
  courseId: string;
  type: QuestionType;
  questionText: string;
  proposals?: unknown;
  correctAnswers?: string[] | null;
  explanation?: string | null;
  positionOrder?: number | null;
};

export type QuestionUpdate = Partial<
  Pick<Question, 'type' | 'questionText' | 'proposals' | 'correctAnswers' | 'explanation' | 'positionOrder'>
>;

export type SupabaseQuestionUpdate = Partial<
  Pick<SupabaseQuestion, 'type' | 'question_text' | 'proposals' | 'correct_answers' | 'explanation' | 'position_order'>
>;
