import type { SupabaseSession } from 'src/domain/teaching/session/types/session.type';
import type {
  SupabaseSessionStudent,
  SupabaseStudentJoinedSession,
} from 'src/domain/teaching/student-session/types/student-session.type';
import { StudentSessionMapper } from './student-session.mapper';

describe('StudentSessionMapper', () => {
  const sessionA: SupabaseSession = {
    id: 'session-1',
    teacher_id: 'teacher-1',
    name: 'Session de maths',
    code: 'ABC123',
    language: 'francais',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  const sessionB: SupabaseSession = {
    id: 'session-2',
    teacher_id: 'teacher-1',
    name: "Session d'anglais",
    code: 'XYZ789',
    language: 'anglais',
    created_at: '2026-01-05T00:00:00.000Z',
  };

  describe('mapEnrollmentRowsWithEmbeddedSessions', () => {
    it('maps a row with a single embedded session object', () => {
      const rows: SupabaseStudentJoinedSession[] = [{ joined_at: '2026-01-15T10:00:00.000Z', sessions: sessionA }];

      expect(StudentSessionMapper.mapEnrollmentRowsWithEmbeddedSessions(rows)).toEqual([
        {
          id: 'session-1',
          teacherId: 'teacher-1',
          name: 'Session de maths',
          code: 'ABC123',
          language: 'francais',
          createdAt: '2026-01-01T00:00:00.000Z',
          studentCount: 0,
          pendingQuestionCount: 0,
          joinedAt: '2026-01-15T10:00:00.000Z',
        },
      ]);
    });

    it('returns an empty array for empty input', () => {
      expect(StudentSessionMapper.mapEnrollmentRowsWithEmbeddedSessions([])).toEqual([]);
    });

    it('maps multiple rows preserving order', () => {
      const rows: SupabaseStudentJoinedSession[] = [
        { joined_at: '2026-02-01T00:00:00.000Z', sessions: sessionB },
        { joined_at: '2026-01-15T10:00:00.000Z', sessions: sessionA },
      ];

      const result = StudentSessionMapper.mapEnrollmentRowsWithEmbeddedSessions(rows);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('session-2');
      expect(result[0].joinedAt).toBe('2026-02-01T00:00:00.000Z');
      expect(result[1].id).toBe('session-1');
    });

    it('maps every session when embed is an array (same joined_at)', () => {
      const rows: SupabaseStudentJoinedSession[] = [
        {
          joined_at: '2026-03-01T12:00:00.000Z',
          sessions: [sessionB, sessionA],
        },
      ];

      const result = StudentSessionMapper.mapEnrollmentRowsWithEmbeddedSessions(rows);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.joinedAt === '2026-03-01T12:00:00.000Z')).toBe(true);
      expect(result[0].id).toBe('session-2');
      expect(result[1].id).toBe('session-1');
    });

    it('skips rows with null sessions embed', () => {
      const rows: SupabaseStudentJoinedSession[] = [
        { joined_at: '2026-01-01T00:00:00.000Z', sessions: null },
        { joined_at: '2026-02-01T00:00:00.000Z', sessions: sessionA },
      ];

      expect(StudentSessionMapper.mapEnrollmentRowsWithEmbeddedSessions(rows)).toEqual([
        {
          id: 'session-1',
          teacherId: 'teacher-1',
          name: 'Session de maths',
          code: 'ABC123',
          language: 'francais',
          createdAt: '2026-01-01T00:00:00.000Z',
          studentCount: 0,
          pendingQuestionCount: 0,
          joinedAt: '2026-02-01T00:00:00.000Z',
        },
      ]);
    });
  });

  describe('mapEnrollmentRowsWithEmbeddedStudents', () => {
    it('maps roster rows via embedded student', () => {
      const rows: SupabaseSessionStudent[] = [
        {
          joined_at: '2026-01-15T10:00:00.000Z',
          students: {
            id: 'student-1',
            name: 'Alice',
            email: 'alice@school.com',
            photo_url: 'https://x/a.png',
          },
        },
      ];

      expect(StudentSessionMapper.mapEnrollmentRowsWithEmbeddedStudents(rows)).toEqual([
        {
          id: 'student-1',
          name: 'Alice',
          email: 'alice@school.com',
          photoUrl: 'https://x/a.png',
          joinedAt: '2026-01-15T10:00:00.000Z',
        },
      ]);
    });

    it('returns an empty array for empty roster input', () => {
      expect(StudentSessionMapper.mapEnrollmentRowsWithEmbeddedStudents([])).toEqual([]);
    });
  });
});
