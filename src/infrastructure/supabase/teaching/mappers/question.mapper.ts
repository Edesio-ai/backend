import {
  CreateQuestionBody,
  Question,
  SupabaseQuestion,
} from 'src/domain/teaching/types/question.type';

type SupabaseQuestionInsert = {
  course_id: string;
  type: string;
  question: string;
  propositions?: unknown | null;
  correct_answer?: string | null;
  correct_answers?: string[] | null;
  explication?: string | null;
  position_order?: number | null;
};

export function createQuestionBodyToSupabaseQuestionInsert(
  body: CreateQuestionBody,
): SupabaseQuestionInsert {
  return {
    course_id: body.courseId,
    type: body.type,
    question: body.question,
    propositions: body.options ?? null,
    correct_answer: body.correctAnswer ?? null,
    correct_answers: body.correctAnswers ?? null,
    explication: body.explanation ?? null,
    position_order: body.positionOrder ?? null,
  };
}

export function supabaseQuestionToQuestion(row: SupabaseQuestion): Question {
  return {
    id: row.id,
    courseId: row.course_id,
    type: row.type,
    question: row.question,
    options: row.propositions,
    correctAnswer: row.correct_answer,
    correctAnswers: row.correct_answers,
    explanation: row.explication,
    createdAt: row.created_at,
    positionOrder: row.position_order,
  };
}
