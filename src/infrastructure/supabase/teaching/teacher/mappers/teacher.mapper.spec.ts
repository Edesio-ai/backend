import { TeacherMapper } from './teacher.mapper';
import { SupabaseTeacher } from 'src/domain/teaching/teacher/types/teacher.type';
import { SupabaseSession } from 'src/domain/teaching/session/types/session.type';

describe('TeacherMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toDomain', () => {
    it('maps snake_case row to domain Teacher', () => {
      const result = fixtures.whenToDomain();

      fixtures.thenReturnsExpectedTeacher(result);
    });
  });

  describe('sessionToDomain', () => {
    it('maps sessions row to domain Session', () => {
      const result = fixtures.whenSessionToDomain();

      fixtures.thenReturnsExpectedTeacherSession(result);
    });
  });

  describe('toInsert', () => {
    it('builds insert object', () => {
      const result = fixtures.whenToInsert();

      fixtures.thenMatchesExpectedInsert(result);
    });
  });

  describe('toInsertWithEstablishment', () => {
    it('maps teacher onboarding fields including normalized email', () => {
      expect(
        TeacherMapper.toInsertWithEstablishment(
          'u1',
          'A B',
          'Teacher@School.com ',
          'est-1',
          2,
        ),
      ).toEqual({
        supabase_user_id: 'u1',
        name: 'A B',
        email: 'teacher@school.com',
        establishment_id: 'est-1',
        available_chatbots: 2,
      });
    });
  });

  describe('toEstablishmentUpdate', () => {
    it('builds update payload', () => {
      const result = fixtures.whenToEstablishmentUpdate();

      fixtures.thenMatchesExpectedEstablishmentUpdate(result);
    });
  });

  describe('toCondition', () => {
    it('converts establishmentId to establishment_id', () => {
      const result = fixtures.whenToConditionEstablishmentOnly();

      fixtures.thenMatchesExpectedConditionEstablishment(result);
    });

    it('converts teacherId to teacher_id', () => {
      const result = fixtures.whenToConditionTeacherOnly();

      fixtures.thenMatchesExpectedConditionTeacher(result);
    });

    it('keeps id unchanged (no uppercase)', () => {
      const result = fixtures.whenToConditionIdOnly();

      fixtures.thenMatchesExpectedConditionId(result);
    });

    it('converts multiple conditions at once', () => {
      const result = fixtures.whenToConditionMultiple();

      fixtures.thenMatchesExpectedConditionMultiple(result);
    });

    it('returns empty object when no conditions provided', () => {
      const result = fixtures.whenToConditionEmpty();

      fixtures.thenMatchesExpectedConditionEmpty(result);
    });
  });
});

class Fixtures {
  public readonly teacherRow: SupabaseTeacher = {
    id: 't-1',
    name: 'Prof',
    email: 'p@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    establishment_id: 'est-1',
    available_chatbots: 3,
    supabase_user_id: 'user-1',
  };

  public readonly expectedTeacher = {
    id: 't-1',
    name: 'Prof',
    email: 'p@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: 'est-1',
    availableChatbots: 3,
    supabaseUserId: 'user-1',
  };

  public readonly sessionRow: SupabaseSession = {
    id: 's-1',
    name: 'Cours',
    code: 'ABC',
    language: 'francais',
    teacher_id: 't-1',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedTeacherSession = {
    id: 's-1',
    name: 'Cours',
    code: 'ABC',
    language: 'francais',
    teacherId: 't-1',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  whenToDomain() {
    return TeacherMapper.toDomain(this.teacherRow);
  }

  whenSessionToDomain() {
    return TeacherMapper.sessionToDomain(this.sessionRow);
  }

  whenToInsert() {
    return TeacherMapper.toInsert('u1', 'N', 'e@x.com');
  }

  whenToEstablishmentUpdate() {
    return TeacherMapper.toEstablishmentUpdate('est-2');
  }

  whenToConditionEstablishmentOnly() {
    return TeacherMapper.toCondition({ establishmentId: 'est-1' });
  }

  whenToConditionTeacherOnly() {
    return TeacherMapper.toCondition({ teacherId: 't-1' });
  }

  whenToConditionIdOnly() {
    return TeacherMapper.toCondition({ id: 'teacher-1' });
  }

  whenToConditionMultiple() {
    return TeacherMapper.toCondition({
      id: 'teacher-1',
      establishmentId: 'est-1',
    });
  }

  whenToConditionEmpty() {
    return TeacherMapper.toCondition({});
  }

  thenReturnsExpectedTeacher(result: unknown) {
    expect(result).toEqual(this.expectedTeacher);
  }

  thenReturnsExpectedTeacherSession(result: unknown) {
    expect(result).toEqual(this.expectedTeacherSession);
  }

  thenMatchesExpectedInsert(result: unknown) {
    expect(result).toEqual({
      supabase_user_id: 'u1',
      name: 'N',
      email: 'e@x.com',
    });
  }

  thenMatchesExpectedEstablishmentUpdate(result: unknown) {
    expect(result).toEqual({
      establishment_id: 'est-2',
    });
  }

  thenMatchesExpectedConditionEstablishment(result: unknown) {
    expect(result).toEqual({
      establishment_id: 'est-1',
    });
  }

  thenMatchesExpectedConditionTeacher(result: unknown) {
    expect(result).toEqual({
      teacher_id: 't-1',
    });
  }

  thenMatchesExpectedConditionId(result: unknown) {
    expect(result).toEqual({
      id: 'teacher-1',
    });
  }

  thenMatchesExpectedConditionMultiple(result: unknown) {
    expect(result).toEqual({
      id: 'teacher-1',
      establishment_id: 'est-1',
    });
  }

  thenMatchesExpectedConditionEmpty(result: unknown) {
    expect(result).toEqual({});
  }
}
