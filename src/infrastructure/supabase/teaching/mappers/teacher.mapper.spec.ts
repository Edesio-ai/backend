import {
  conditionToSupabaseCondition,
  createTeacherInsertPayload,
  createTeacherWithEstablishmentInsertPayload,
  linkTeacherEstablishmentUpdatePayload,
  supabaseTeacherSessionToTeacherSession,
  supabaseTeacherToTeacher,
} from './teacher.mapper';
import {
  SupabaseTeacher,
  SupabaseTeacherSession,
} from 'src/domain/teaching/types/teacher.type';

describe('teacher.mapper', () => {
  describe('supabaseTeacherToTeacher', () => {
    it('maps snake_case row to domain Teacher', () => {
      const row: SupabaseTeacher = {
        id: 't-1',
        name: 'Prof',
        email: 'p@school.com',
        created_at: '2026-01-01T00:00:00.000Z',
        establishment_id: 'est-1',
        available_chatbots: 3,
        supabase_user_id: 'user-1',
      };

      expect(supabaseTeacherToTeacher(row)).toEqual({
        id: 't-1',
        name: 'Prof',
        email: 'p@school.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        establishmentId: 'est-1',
        availableChatbots: 3,
        supabaseUserId: 'user-1',
      });
    });
  });

  describe('supabaseTeacherSessionToTeacherSession', () => {
    it('maps sessions row to domain TeacherSession', () => {
      const row: SupabaseTeacherSession = {
        id: 's-1',
        name: 'Cours',
        code: 'ABC',
        language: 'francais',
        teacher_id: 't-1',
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(supabaseTeacherSessionToTeacherSession(row)).toEqual({
        id: 's-1',
        name: 'Cours',
        code: 'ABC',
        language: 'francais',
        teacherId: 't-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('createTeacherInsertPayload', () => {
    it('builds insert object', () => {
      expect(createTeacherInsertPayload('u1', 'N', 'e@x.com')).toEqual({
        supabase_user_id: 'u1',
        name: 'N',
        email: 'e@x.com',
      });
    });
  });

  describe('createTeacherWithEstablishmentInsertPayload', () => {
    it('builds insert with establishment', () => {
      expect(
        createTeacherWithEstablishmentInsertPayload(
          'u1',
          'A B',
          'E@X.COM',
          'est-1',
          2,
        ),
      ).toEqual({
        supabase_user_id: 'u1',
        name: 'A B',
        email: 'e@x.com',
        establishment_id: 'est-1',
        available_chatbots: 2,
      });
    });
  });

  describe('linkTeacherEstablishmentUpdatePayload', () => {
    it('builds update payload', () => {
      expect(linkTeacherEstablishmentUpdatePayload('est-2')).toEqual({
        establishment_id: 'est-2',
      });
    });
  });

  describe('conditionToSupabaseCondition', () => {
    it('converts establishmentId to establishment_id', () => {
      expect(
        conditionToSupabaseCondition({ establishmentId: 'est-1' }),
      ).toEqual({ establishment_id: 'est-1' });
    });

    it('converts teacherId to teacher_id', () => {
      expect(conditionToSupabaseCondition({ teacherId: 't-1' })).toEqual({
        teacher_id: 't-1',
      });
    });

    it('keeps id unchanged (no uppercase)', () => {
      expect(conditionToSupabaseCondition({ id: 'teacher-1' })).toEqual({
        id: 'teacher-1',
      });
    });

    it('converts multiple conditions at once', () => {
      expect(
        conditionToSupabaseCondition({
          id: 'teacher-1',
          establishmentId: 'est-1',
        }),
      ).toEqual({
        id: 'teacher-1',
        establishment_id: 'est-1',
      });
    });

    it('returns empty object when no conditions provided', () => {
      expect(conditionToSupabaseCondition({})).toEqual({});
    });
  });
});
