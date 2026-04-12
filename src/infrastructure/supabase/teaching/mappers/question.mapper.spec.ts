import {
  createQuestionBodyToSupabaseQuestionInsert,
  supabaseQuestionToQuestion,
} from './question.mapper';
import { SupabaseQuestion } from 'src/domain/teaching/types/question.type';

describe('question.mapper', () => {
  describe('supabaseQuestionToQuestion', () => {
    it('maps snake_case row to domain Question', () => {
      const row: SupabaseQuestion = {
        id: 'q-1',
        course_id: 'c-1',
        type: 'qcm',
        question: '2+2 ?',
        propositions: [{ id: 'a', label: '4' }],
        correct_answer: 'a',
        correct_answers: null,
        explication: 'arithmétique',
        created_at: '2026-01-01T00:00:00.000Z',
        position_order: 1,
      };

      expect(supabaseQuestionToQuestion(row)).toEqual({
        id: 'q-1',
        courseId: 'c-1',
        type: 'qcm',
        question: '2+2 ?',
        options: [{ id: 'a', label: '4' }],
        correctAnswer: 'a',
        correctAnswers: null,
        explanation: 'arithmétique',
        createdAt: '2026-01-01T00:00:00.000Z',
        positionOrder: 1,
      });
    });
  });

  describe('createQuestionBodyToSupabaseQuestionInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      expect(
        createQuestionBodyToSupabaseQuestionInsert({
          courseId: 'c-1',
          type: 'ouverte',
          question: 'Votre avis ?',
          options: null,
          correctAnswer: null,
          correctAnswers: ['oui', 'non'],
          explanation: null,
          positionOrder: 2,
        }),
      ).toEqual({
        course_id: 'c-1',
        type: 'ouverte',
        question: 'Votre avis ?',
        propositions: null,
        correct_answer: null,
        correct_answers: ['oui', 'non'],
        explication: null,
        position_order: 2,
      });
    });

    it('defaults omitted optional fields to null', () => {
      expect(
        createQuestionBodyToSupabaseQuestionInsert({
          courseId: 'c-1',
          type: 'qcm',
          question: 'OK',
        }),
      ).toEqual({
        course_id: 'c-1',
        type: 'qcm',
        question: 'OK',
        propositions: null,
        correct_answer: null,
        correct_answers: null,
        explication: null,
        position_order: null,
      });
    });
  });
});
