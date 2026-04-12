/** Row shape returned by Supabase for `public.questions` (snake_case columns). */
export type SupabaseQuestion = {
  id: string;
  course_id: string;
  type: string;
  question: string;
  propositions: unknown | null;
  correct_answer: string | null;
  correct_answers: string[] | null;
  explication: string | null;
  created_at: string;
  position_order: number | null;
};

export type Question = {
  id: string;
  courseId: string;
  type: string;
  question: string;
  options: unknown | null;
  correctAnswer: string | null;
  correctAnswers: string[] | null;
  explanation: string | null;
  createdAt: string;
  positionOrder: number | null;
};

export type CreateQuestionBody = {
  courseId: string;
  type: string;
  question: string;
  options?: unknown | null;
  correctAnswer?: string | null;
  correctAnswers?: string[] | null;
  explanation?: string | null;
  positionOrder?: number | null;
};
