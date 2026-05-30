import { GeneratedQuestion } from 'src/domain/llm/types/openai.type';
import {
  SelfLearnerQuestion,
  SelfLearnerQuestionInsert,
  SelfLearnerQuestionInsertSupabase,
  SelfLearnerQuestionSupabase,
} from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';

export const selfLearnerQuestionMapper = {
  toDomain: (data: SelfLearnerQuestionSupabase): SelfLearnerQuestion => {
    return {
      id: data.id,
      courseId: data.course_id,
      type: data.type,
      questionText: data.question_text,
      proposals: data.proposals,
      correctAnswers: data.correct_answers,
      explanation: data.explanation,
      createdAt: data.created_at,
    };
  },
  generatedToInserts: (
    questions: GeneratedQuestion[],
    courseId: string,
  ): SelfLearnerQuestionInsertSupabase[] => {
    return questions.map((q) => ({
      course_id: courseId,
      type: q.type,
      question_text: q.questionText,
      proposals: q.proposals ?? null,
      correct_answers: q.correctAnswers ?? null,
      explanation: q.explanation ?? null,
    }));
  },
  toInsert: (
    payload: SelfLearnerQuestionInsert,
  ): SelfLearnerQuestionInsertSupabase => {
    return {
      course_id: payload.courseId,
      type: payload.type,
      question_text: payload.questionText,
      proposals: payload.proposals,
      correct_answers: payload.correctAnswers,
      explanation: payload.explanation,
    };
  },
};
