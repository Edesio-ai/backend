import {
  CreateQuestionBody,
  Question,
  QuestionUpdate,
  SupabaseQuestion,
  SupabaseQuestionUpdate,
} from 'src/domain/teaching/question/types/question.type';
import { GeneratedQuestion } from 'src/domain/llm/types/openai.type';

type SupabaseQuestionInsert = {
  course_id: string;
  type: string;
  question_text: string;
  proposals?: unknown;
  correct_answers?: string[] | null;
  explanation?: string | null;
  position_order?: number | null;
  cheating_detection_enabled?: boolean;
};

export const QuestionMapper = {
  toDomain: (row: SupabaseQuestion): Question => ({
    id: row.id,
    courseId: row.course_id,
    type: row.type,
    questionText: row.question_text,
    proposals: row.proposals,
    correctAnswers: row.correct_answers,
    explanation: row.explanation,
    createdAt: row.created_at,
    positionOrder: row.position_order,
    cheatingDetectionEnabled: row.cheating_detection_enabled ?? true,
  }),

  toInsert: (body: CreateQuestionBody): SupabaseQuestionInsert => ({
    course_id: body.courseId,
    type: body.type,
    question_text: body.questionText,
    proposals: body.proposals ?? null,
    correct_answers: body.correctAnswers ?? null,
    explanation: body.explanation ?? null,
    position_order: body.positionOrder ?? null,
    cheating_detection_enabled: body.cheatingDetectionEnabled ?? true,
  }),

  generatedToInserts: (questions: GeneratedQuestion[], courseId: string): SupabaseQuestionInsert[] =>
    questions.map((q) => ({
      course_id: courseId,
      type: q.type,
      question_text: q.questionText,
      proposals: q.proposals ?? null,
      correct_answers: q.correctAnswers ?? null,
      explanation: q.explanation ?? null,
      cheating_detection_enabled: true,
    })),

  toUpdate: (updates: QuestionUpdate): SupabaseQuestionUpdate => {
    const row: SupabaseQuestionUpdate = {};
    if (updates.type !== undefined) row.type = updates.type;
    if (updates.questionText !== undefined) row.question_text = updates.questionText;
    if (updates.proposals !== undefined) row.proposals = updates.proposals;
    if (updates.correctAnswers !== undefined) row.correct_answers = updates.correctAnswers;
    if (updates.explanation !== undefined) row.explanation = updates.explanation;
    if (updates.positionOrder !== undefined) row.position_order = updates.positionOrder;
    if (updates.cheatingDetectionEnabled !== undefined) {
      row.cheating_detection_enabled = updates.cheatingDetectionEnabled;
    }
    return row;
  },
};
