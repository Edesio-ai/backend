import { QuestionMapper } from './question.mapper';
import { SupabaseQuestion } from 'src/domain/teaching/types/question.type';

describe('QuestionMapper', () => {
  describe('toDomain', () => {
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

      expect(QuestionMapper.toDomain(row)).toEqual({
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

  describe('toInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      expect(
        QuestionMapper.toInsert({
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
        QuestionMapper.toInsert({
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

  describe('toUpdate', () => {
    it('maps only provided camelCase keys to snake_case', () => {
      expect(
        QuestionMapper.toUpdate({
          questionText: 'Nouveau libellé',
          correctAnswers: ['a'],
        }),
      ).toEqual({
        question_text: 'Nouveau libellé',
        correct_answers: ['a'],
      });
    });

    it('returns empty object when no fields are set', () => {
      expect(QuestionMapper.toUpdate({})).toEqual({});
    });

    it('maps all fields correctly when all are provided', () => {
      expect(
        QuestionMapper.toUpdate({
          type: 'multiple',
          questionText: 'Quel est 2+2 ?',
          proposals: ['2', '4', '6', '8'],
          correctAnswers: ['4'],
          explanation: 'Simple addition',
          positionOrder: 3,
        }),
      ).toEqual({
        type: 'multiple',
        question_text: 'Quel est 2+2 ?',
        proposals: ['2', '4', '6', '8'],
        correct_answers: ['4'],
        explanation: 'Simple addition',
        position_order: 3,
      });
    });

    it('maps only type when only type is provided', () => {
      expect(QuestionMapper.toUpdate({ type: 'open' })).toEqual({ type: 'open' });
    });

    it('maps only positionOrder when only positionOrder is provided', () => {
      expect(QuestionMapper.toUpdate({ positionOrder: 5 })).toEqual({
        position_order: 5,
      });
    });

    it('maps null values for proposals and correctAnswers', () => {
      expect(
        QuestionMapper.toUpdate({ proposals: null, correctAnswers: null }),
      ).toEqual({ proposals: null, correct_answers: null });
    });
  });
});
