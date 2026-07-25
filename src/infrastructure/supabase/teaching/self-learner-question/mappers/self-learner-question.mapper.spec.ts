import type { GeneratedQuestion } from 'src/domain/llm/types/openai.type';
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
          correct_answers: ['p2'],
          explanation: 'car',
          created_at: createdAt,
        }),
      ).toEqual({
        id: 'qu-99',
        courseId: 'c-9',
        type: 'multiple',
        questionText: 'Choix multiples',
        proposals: ['p1', 'p2'],
        correctAnswers: ['p2'],
        explanation: 'car',
        createdAt,
      });
    });
  });

  describe('generatedToInserts', () => {
    it('maps generated questions to snake_case rows scoped by course id', () => {
      expect(
        selfLearnerQuestionMapper.generatedToInserts(
          [
            {
              type: 'open',
              questionText: 'Open?',
              keyConcepts: [],
              proposals: [],
              correctAnswers: [],
              explanation: 'hint',
            },
          ],
          'course-x',
        ),
      ).toEqual([
        {
          course_id: 'course-x',
          type: 'open',
          question_text: 'Open?',
          proposals: [],
          correct_answers: [],
          explanation: 'hint',
        },
      ]);
    });

    it('falls back to null for optional payloads when absent at runtime', () => {
      const runtimePayload = {
        type: 'single' as const,
        questionText: 't',
        keyConcepts: [] as string[],
      } as unknown as GeneratedQuestion;

      expect(selfLearnerQuestionMapper.generatedToInserts([runtimePayload], 'c')).toEqual([
        {
          course_id: 'c',
          type: 'single',
          question_text: 't',
          proposals: null,
          correct_answers: null,
          explanation: null,
        },
      ]);
    });
  });

  describe('toInsert', () => {
    it('maps domain insert payload to snake_case Supabase row', () => {
      expect(
        selfLearnerQuestionMapper.toInsert({
          courseId: 'c-ins',
          type: 'multiple',
          questionText: 'Plusieurs réponses ?',
          proposals: ['X', 'Y'],
          correctAnswers: ['X', 'Y'],
          explanation: 'car',
        }),
      ).toEqual({
        course_id: 'c-ins',
        type: 'multiple',
        question_text: 'Plusieurs réponses ?',
        proposals: ['X', 'Y'],
        correct_answers: ['X', 'Y'],
        explanation: 'car',
      });
    });
  });

  describe('toUpdate', () => {
    it('maps update payload to snake_case Supabase fields', () => {
      expect(
        selfLearnerQuestionMapper.toUpdate({
          questionText: 'Question modifiée ?',
          correctAnswers: ['B', 'C'],
        }),
      ).toEqual({
        question_text: 'Question modifiée ?',
        correct_answers: ['B', 'C'],
      });
    });
  });
});
