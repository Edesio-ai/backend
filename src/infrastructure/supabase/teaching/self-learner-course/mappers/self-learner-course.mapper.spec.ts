import { SelfLearnerCourseMapper } from './self-learner-course.use-case';

describe('SelfLearnerCourseMapper', () => {
  describe('toDomain', () => {
    it('maps Supabase row to domain', () => {
      expect(
        SelfLearnerCourseMapper.toDomain({
          id: 'c-1',
          self_learner_id: 'sl-1',
          name: 'My course',
          email: '',
          created_at: '2026-01-01T00:00:00.000Z',
        }),
      ).toEqual({
        id: 'c-1',
        selfLearnerId: 'sl-1',
        name: 'My course',
        email: '',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });
});
