import { SessionMapper } from './session.mapper';
import { SupabaseSession } from 'src/domain/teaching/types/session.type';
import { SupabaseCourseWithSession } from 'src/domain/teaching/types/course.type';

describe('SessionMapper', () => {
  describe('toDomain', () => {
    it('maps snake_case row to domain Session', () => {
      const row: SupabaseSession = {
        id: 's-1',
        teacher_id: 't-1',
        name: 'Cours',
        code: 'ABCD',
        language: 'francais',
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(SessionMapper.toDomain(row)).toEqual({
        id: 's-1',
        teacherId: 't-1',
        name: 'Cours',
        code: 'ABCD',
        language: 'francais',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('toInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      expect(
        SessionMapper.toInsert({
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

  describe('toUpdate', () => {
    it('maps update body to patch payload', () => {
      expect(
        SessionMapper.toUpdate({
          name: 'Renommé',
          teacherId: 't-1',
        }),
      ).toEqual({ name: 'Renommé' });
    });
  });

  describe('courseWithSessionToDomain', () => {
    it('maps a full row (with nested teachers) to a CourseWithSession domain object', () => {
      const row: SupabaseCourseWithSession = {
        id: 'c-1',
        title: 'Cours',
        description: 'Desc',
        text_content: 'Contenu',
        validated_questions: true,
        position_order: 2,
        sessions: {
          id: 's-1',
          teacher_id: 't-1',
          name: 'Session',
          code: 'ABCD',
          language: 'francais',
          created_at: '2026-01-01T00:00:00.000Z',
          teachers: {
            id: 'teacher-1',
            name: 'Prof Martin',
            email: 'martin@school.com',
            created_at: '2026-01-01T00:00:00.000Z',
            establishment_id: 'est-1',
            available_chatbots: 2,
          },
        },
      };

      expect(SessionMapper.courseWithSessionToDomain(row)).toEqual({
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
        teachers: {
          id: 'teacher-1',
          name: 'Prof Martin',
          email: 'martin@school.com',
          createdAt: '2026-01-01T00:00:00.000Z',
          establishmentId: 'est-1',
        },
      });
    });

    it('uses fallbacks when sessions fields are missing', () => {
      const row: SupabaseCourseWithSession = {
        id: 'c-2',
        title: 'Cours',
        description: null,
        text_content: null,
        sessions: {},
      };

      const result = SessionMapper.courseWithSessionToDomain(row);

      expect(result.session.id).toBe('');
      expect(result.session.teacherId).toBe('');
      expect(result.session.language).toBe('francais');
      expect(result.teachers.id).toBe('');
      expect(result.teachers.establishmentId).toBe('');
    });
  });
});
