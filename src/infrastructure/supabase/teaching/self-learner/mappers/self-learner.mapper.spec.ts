import { SelfLearnerMapper } from './self-learner.mapper';
import type { SelfLearnerSupabase } from 'src/domain/teaching/self-learner/types/self-learner.type';

describe('SelfLearnerMapper', () => {
  describe('toInsert', () => {
    it('maps domain insert payload to Supabase row shape', () => {
      expect(
        SelfLearnerMapper.toInsert({
          supabaseUserId: 'user-1',
          name: 'Jean Dupont',
          email: 'j@school.com',
        }),
      ).toEqual({
        supabase_user_id: 'user-1',
        name: 'Jean Dupont',
        email: 'j@school.com',
      });
    });
  });

  describe('toDomain', () => {
    it('maps Supabase row to domain type', () => {
      const row: SelfLearnerSupabase = {
        id: 'sl-1',
        supabase_user_id: 'user-1',
        name: 'Jean Dupont',
        email: 'j@school.com',
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(SelfLearnerMapper.toDomain(row)).toEqual({
        id: 'sl-1',
        supabaseUserId: 'user-1',
        name: 'Jean Dupont',
        email: 'j@school.com',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });
});
