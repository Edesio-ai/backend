import {
  createSessionBodyToSupabaseSessionInsert,
  supabaseCourseWithSessionToCourseWithSession,
  supabaseSessionToSession,
  updateSessionNameBodyToSupabaseSessionUpdate,
} from './session.mapper';
import { SupabaseSession } from 'src/domain/teaching/types/session.type';
import { SupabaseCourseWithSession } from 'src/domain/teaching/types/course.type';

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

  describe('supabaseCourseWithSessionToCourseWithSession', () => {
    it('maps a full row to a CourseWithSession domain object', () => {
      const row: SupabaseCourseWithSession = {
        id: 'c-1',
        title: 'Cours',
        description: 'Desc',
        content_text: 'Contenu',
        validated_questions: true,
        position_order: 2,
        session: {
          id: 's-1',
          teacher_id: 't-1',
          name: 'Session',
          code: 'ABCD',
          language: 'francais',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      };

      expect(supabaseCourseWithSessionToCourseWithSession(row)).toEqual({
        id: 'c-1',
        title: 'Cours',
        description: 'Desc',
        contentText: 'Contenu',
        validatedQuestions: true,
        positionOrder: 2,
        session: {
          id: 's-1',
          teacherId: 't-1',
          name: 'Session',
          code: 'ABCD',
          language: 'francais',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      });
    });

    it('uses fallbacks when session fields are missing', () => {
      const row: SupabaseCourseWithSession = {
        id: 'c-2',
        title: 'Cours',
        description: null,
        content_text: null,
        session: {},
      };

      const result = supabaseCourseWithSessionToCourseWithSession(row);

      expect(result.session.teacherId).toBe('');
      expect(result.session.language).toBe('francais');
      expect(result.session.id).toBe('');
    });
  });
});
