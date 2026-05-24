import { selfLearnerQuestionMapper } from './self-learner-question.mapper';

describe('selfLearnerQuestionMapper', () => {
  describe('toDomain', () => {
    it('maps Supabase row to domain', () => {
      const createdAt = new Date('2026-02-03T09:30:00.000Z');

      expect(
        selfLearnerQuestionMapper.toDomain({
          id: 'qu-99',
          course_id: 'c-9',
          type: 'multiple',
          question_text: 'Choix multiples',
          proposals: ['p1', 'p2'],
          correct_answer: ['p2'],
          explanation: 'car',
          created_at: createdAt,
        }),
      ).toEqual({
        id: 'qu-99',
        courseId: 'c-9',
        type: 'multiple',
        questionText: 'Choix multiples',
        proposals: ['p1', 'p2'],
        correctAnswer: ['p2'],
        explanation: 'car',
        createdAt,
      });
    });
  });
});
