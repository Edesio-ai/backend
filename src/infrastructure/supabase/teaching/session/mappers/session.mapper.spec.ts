import { SessionMapper } from './session.mapper';
import { SupabaseSession } from 'src/domain/teaching/session/types/session.type';
import { SupabaseCourseWithSession } from 'src/domain/teaching/course/types/course.type';

describe('SessionMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toDomain', () => {
    it('maps snake_case row to domain Session', () => {
      const result = fixtures.whenToDomain();

      fixtures.thenReturnsExpectedSession(result);
    });

    it('defaults studentCount and pendingQuestionCount to 0 when embeds are missing', () => {
      const result = SessionMapper.toDomain({
        id: 's-2',
        teacher_id: 't-1',
        name: 'Cours',
        code: 'ZZZZ',
        language: 'francais',
        created_at: '2026-01-01T00:00:00.000Z',
      });

      expect(result.studentCount).toBe(0);
      expect(result.pendingQuestionCount).toBe(0);
    });

    it('sums pending course question counts across courses', () => {
      const result = SessionMapper.toDomain({
        id: 's-3',
        teacher_id: 't-1',
        name: 'Cours',
        code: 'PEND',
        language: 'francais',
        created_at: '2026-01-01T00:00:00.000Z',
        courses: [
          { pending_course_questions: [{ count: 2 }] },
          { pending_course_questions: [{ count: 3 }] },
          { pending_course_questions: null },
        ],
      });

      expect(result.pendingQuestionCount).toBe(5);
    });
  });

  describe('toInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      const result = fixtures.whenToInsert();

      fixtures.thenMatchesExpectedInsert(result);
    });
  });

  describe('toUpdate', () => {
    it('maps update body to patch payload', () => {
      const result = fixtures.whenToUpdate();

      fixtures.thenMatchesExpectedUpdate(result);
    });
  });

  describe('courseWithSessionToDomain', () => {
    it('maps a full row (with nested teachers) to a CourseWithSession domain object', () => {
      const result = fixtures.whenCourseWithSessionToDomainFull();

      fixtures.thenReturnsExpectedCourseWithSession(result);
    });

    it('uses fallbacks when sessions fields are missing', () => {
      const result = fixtures.whenCourseWithSessionToDomainSparse();

      fixtures.thenMatchesCourseWithSessionFallbacks(result);
    });
  });
});

class Fixtures {
  public readonly supabaseSessionRow: SupabaseSession = {
    id: 's-1',
    teacher_id: 't-1',
    name: 'Cours',
    code: 'ABCD',
    language: 'francais',
    created_at: '2026-01-01T00:00:00.000Z',
    sessions_student_count: [{ count: 3 }],
    courses: [{ pending_course_questions: [{ count: 1 }] }, { pending_course_questions: [{ count: 4 }] }],
  };

  public readonly expectedSession = {
    id: 's-1',
    teacherId: 't-1',
    name: 'Cours',
    code: 'ABCD',
    language: 'francais',
    createdAt: '2026-01-01T00:00:00.000Z',
    studentCount: 3,
    pendingQuestionCount: 5,
  };

  public readonly courseWithSessionFullRow: SupabaseCourseWithSession = {
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

  public readonly expectedCourseWithSession = {
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
      studentCount: 0,
      pendingQuestionCount: 0,
    },
    teachers: {
      id: 'teacher-1',
      name: 'Prof Martin',
      email: 'martin@school.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      establishmentId: 'est-1',
    },
  };

  public readonly courseWithSessionSparseRow: SupabaseCourseWithSession = {
    id: 'c-2',
    title: 'Cours',
    description: null,
    text_content: null,
    sessions: {},
  };

  whenToDomain() {
    return SessionMapper.toDomain(this.supabaseSessionRow);
  }

  whenToInsert() {
    return SessionMapper.toInsert({
      teacherId: 't-1',
      name: 'N',
      code: 'CODE',
      language: 'anglais',
    });
  }

  whenToUpdate() {
    return SessionMapper.toUpdate({
      name: 'Renommé',
      teacherId: 't-1',
    });
  }

  whenCourseWithSessionToDomainFull() {
    return SessionMapper.courseWithSessionToDomain(this.courseWithSessionFullRow);
  }

  whenCourseWithSessionToDomainSparse() {
    return SessionMapper.courseWithSessionToDomain(this.courseWithSessionSparseRow);
  }

  thenReturnsExpectedSession(result: unknown) {
    expect(result).toEqual(this.expectedSession);
  }

  thenMatchesExpectedInsert(result: unknown) {
    expect(result).toEqual({
      teacher_id: 't-1',
      name: 'N',
      code: 'CODE',
      language: 'anglais',
    });
  }

  thenMatchesExpectedUpdate(result: unknown) {
    expect(result).toEqual({ name: 'Renommé' });
  }

  thenReturnsExpectedCourseWithSession(result: unknown) {
    expect(result).toEqual(this.expectedCourseWithSession);
  }

  thenMatchesCourseWithSessionFallbacks(result: ReturnType<typeof SessionMapper.courseWithSessionToDomain>) {
    expect(result.session.id).toBe('');
    expect(result.session.teacherId).toBe('');
    expect(result.session.language).toBe('francais');
    expect(result.session.studentCount).toBe(0);
    expect(result.session.pendingQuestionCount).toBe(0);
    expect(result.teachers.id).toBe('');
    expect(result.teachers.establishmentId).toBe('');
  }
}
