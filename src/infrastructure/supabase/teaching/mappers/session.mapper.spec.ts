import {
  createSessionBodyToSupabaseSessionInsert,
  supabaseSessionToSession,
  updateSessionNameBodyToSupabaseSessionUpdate,
} from './session.mapper';
import { SupabaseSession } from 'src/domain/teaching/types/session.type';

describe('session.mapper', () => {
  describe('supabaseSessionToSession', () => {
    it('maps snake_case row to domain Session', () => {
      const row: SupabaseSession = {
        id: 's-1',
        teacher_id: 't-1',
        name: 'Cours',
        code: 'ABCD',
        language: 'francais',
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(supabaseSessionToSession(row)).toEqual({
        id: 's-1',
        teacherId: 't-1',
        name: 'Cours',
        code: 'ABCD',
        language: 'francais',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('createSessionBodyToSupabaseSessionInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      expect(
        createSessionBodyToSupabaseSessionInsert({
          teacherId: 't-1',
          name: 'N',
          code: 'CODE',
          language: 'anglais',
        }),
      ).toEqual({
        teacher_id: 't-1',
        name: 'N',
        code: 'CODE',
        language: 'anglais',
      });
    });
  });

  describe('updateSessionNameBodyToSupabaseSessionUpdate', () => {
    it('maps update body to patch payload', () => {
      expect(
        updateSessionNameBodyToSupabaseSessionUpdate({
          name: 'Renommé',
          teacherId: 't-1',
        }),
      ).toEqual({ name: 'Renommé' });
    });
  });
});
