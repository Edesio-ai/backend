import {
  CreateQuestionBody,
  GeneratedQuestion,
  Question,
  QuestionUpdate,
  SupabaseQuestion,
  SupabaseQuestionUpdate,
} from 'src/domain/teaching/types/question.type';

type SupabaseQuestionInsert = {
  course_id: string;
  type: string;
  question_text: string;
  proposals?: unknown;
  correct_answers?: string[] | null;
  explanation?: string | null;
  position_order?: number | null;
};

export function createQuestionBodyToSupabaseQuestionInsert(
  body: CreateQuestionBody,
): SupabaseQuestionInsert {
  return {
    course_id: body.courseId,
    type: body.type,
    question_text: body.questionText,
    proposals: body.proposals ?? null,
    correct_answers: body.correctAnswers ?? null,
    explanation: body.explanation ?? null,
    position_order: body.positionOrder ?? null,
  };
}

export function supabaseQuestionToQuestion(row: SupabaseQuestion): Question {
  return {
    id: row.id,
    courseId: row.course_id,
    type: row.type,
    questionText: row.question_text,
    proposals: row.proposals,
    correctAnswers: row.correct_answers,
    explanation: row.explanation,
    createdAt: row.created_at,
    positionOrder: row.position_order,
  };
}

export function generatedQuestionsToSupabaseQuestions(
  questions: GeneratedQuestion[],
  courseId: string,
): SupabaseQuestionInsert[] {
  return questions.map((question, index) => ({
    course_id: courseId,
    type: question.type,
    question_text: question.questionText,
    proposals: question.proposals ?? null,
    correct_answers: question.correctAnswers ?? null,
    explanation: question.explanation ?? null,
  }));
}

export function questionUpdatesToSupabaseQuestionUpdate(
  updates: QuestionUpdate,
): SupabaseQuestionUpdate {
  const row: SupabaseQuestionUpdate = {};

  if (updates.type !== undefined) row.type = updates.type;
  if (updates.questionText !== undefined)
    row.question_text = updates.questionText;
  if (updates.proposals !== undefined) row.proposals = updates.proposals;
  if (updates.correctAnswers !== undefined)
    row.correct_answers = updates.correctAnswers;
  if (updates.explanation !== undefined) row.explanation = updates.explanation;
  if (updates.positionOrder !== undefined)
    row.position_order = updates.positionOrder;

  return row;
}
