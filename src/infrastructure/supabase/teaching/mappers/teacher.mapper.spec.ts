import { TeacherMapper } from './teacher.mapper';
import {
  SupabaseTeacher,
  SupabaseTeacherSession,
} from 'src/domain/teaching/types/teacher.type';

describe('TeacherMapper', () => {
  describe('toDomain', () => {
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

      expect(TeacherMapper.toDomain(row)).toEqual({
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

  describe('sessionToDomain', () => {
    it('maps sessions row to domain TeacherSession', () => {
      const row: SupabaseTeacherSession = {
        id: 's-1',
        name: 'Cours',
        code: 'ABC',
        language: 'francais',
        teacher_id: 't-1',
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(TeacherMapper.sessionToDomain(row)).toEqual({
        id: 's-1',
        name: 'Cours',
        code: 'ABC',
        language: 'francais',
        teacherId: 't-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('toInsert', () => {
    it('builds insert object', () => {
      expect(TeacherMapper.toInsert('u1', 'N', 'e@x.com')).toEqual({
        supabase_user_id: 'u1',
        name: 'N',
        email: 'e@x.com',
      });
    });
  });

  describe('toInsertWithEstablishment', () => {
    it('builds insert with establishment', () => {
      expect(
        TeacherMapper.toInsertWithEstablishment(
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

  describe('toEstablishmentUpdate', () => {
    it('builds update payload', () => {
      expect(TeacherMapper.toEstablishmentUpdate('est-2')).toEqual({
        establishment_id: 'est-2',
      });
    });
  });

  describe('toCondition', () => {
    it('converts establishmentId to establishment_id', () => {
      expect(TeacherMapper.toCondition({ establishmentId: 'est-1' })).toEqual({
        establishment_id: 'est-1',
      });
    });

    it('converts teacherId to teacher_id', () => {
      expect(TeacherMapper.toCondition({ teacherId: 't-1' })).toEqual({
        teacher_id: 't-1',
      });
    });

    it('keeps id unchanged (no uppercase)', () => {
      expect(TeacherMapper.toCondition({ id: 'teacher-1' })).toEqual({
        id: 'teacher-1',
      });
    });

    it('converts multiple conditions at once', () => {
      expect(
        TeacherMapper.toCondition({
          id: 'teacher-1',
          establishmentId: 'est-1',
        }),
      ).toEqual({
        id: 'teacher-1',
        establishment_id: 'est-1',
      });
    });

    it('returns empty object when no conditions provided', () => {
      expect(TeacherMapper.toCondition({})).toEqual({});
    });
  });
});
