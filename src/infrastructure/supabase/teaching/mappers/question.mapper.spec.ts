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
        type: 'single',
        question_text: '2+2 ?',
        proposals: [{ id: 'a', label: '4' }],
        correct_answers: ['a'],
        explanation: 'arithmétique',
        created_at: '2026-01-01T00:00:00.000Z',
        position_order: 1,
      };

      expect(supabaseQuestionToQuestion(row)).toEqual({
        id: 'q-1',
        courseId: 'c-1',
        type: 'single',
        questionText: '2+2 ?',
        proposals: [{ id: 'a', label: '4' }],
        correctAnswers: ['a'],
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
          type: 'open',
          questionText: 'Votre avis ?',
          proposals: null,
          correctAnswers: ['oui', 'non'],
          explanation: null,
          positionOrder: 2,
        }),
      ).toEqual({
        course_id: 'c-1',
        type: 'open',
        question_text: 'Votre avis ?',
        proposals: null,
        correct_answers: ['oui', 'non'],
        explanation: null,
        position_order: 2,
      });
    });

    it('defaults omitted optional fields to null', () => {
      expect(
        createQuestionBodyToSupabaseQuestionInsert({
          courseId: 'c-1',
          type: 'single',
          questionText: 'OK',
        }),
      ).toEqual({
        course_id: 'c-1',
        type: 'single',
        question_text: 'OK',
        proposals: null,
        correct_answers: null,
        explanation: null,
        position_order: null,
      });
    });
  });
});
