import { SelfLearnerCourseMapper } from './self-learner-course.use-case';

describe('SelfLearnerCourseMapper', () => {
  describe('toInsert', () => {
    it('maps domain insert payload including text_content', () => {
      expect(
        SelfLearnerCourseMapper.toInsert({
          selfLearnerId: 'sl-1',
          title: 'Titre',
          description: 'D',
          textContent: 'Contenu',
          language: 'anglais',
        }),
      ).toEqual({
        self_learner_id: 'sl-1',
        title: 'Titre',
        description: 'D',
        text_content: 'Contenu',
        language: 'anglais',
      });
    });
  });

  describe('toDomain', () => {
    it('maps Supabase row to domain', () => {
      expect(
        SelfLearnerCourseMapper.toDomain({
          id: 'c-1',
          self_learner_id: 'sl-1',
          title: 'Mon cours',
          description: null,
          text_content: null,
          language: 'francais',
          created_at: '2026-01-01T00:00:00.000Z',
        }),
      ).toEqual({
        id: 'c-1',
        selfLearnerId: 'sl-1',
        title: 'Mon cours',
        description: null,
        textContent: null,
        language: 'francais',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });
});
