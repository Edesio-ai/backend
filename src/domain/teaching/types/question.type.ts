export type QuestionType = 'single' | 'multiple' | 'open';

export type SupabaseQuestion = {
  id: string;
  course_id: string;
  type: QuestionType;
  question: string;
  propositions: unknown;
  correct_answer: string | null;
  correct_answers: string[] | null;
  explication: string | null;
  created_at: string;
  position_order: number | null;
};

export type Question = {
  id: string;
  courseId: string;
  type: QuestionType;
  question: string;
  propositions: unknown;
  correctAnswer: string | null;
  correctAnswers: string[] | null;
  explanation: string | null;
  createdAt: string;
  positionOrder: number | null;
};

export type CreateQuestionBody = {
  courseId: string;
  type: QuestionType;
  question: string;
  propositions?: unknown;
  correctAnswer?: string | null;
  correctAnswers?: string[] | null;
  explanation?: string | null;
  positionOrder?: number | null;
};
