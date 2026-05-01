import { StudentMapper } from './student.mapper';
import { mapList } from 'src/infrastructure/supabase/common/mapper.util';
import {
  SupabaseStudentSession,
  SupabaseStudentCourseStats,
  SupabaseStudentJoinedSession,
} from 'src/domain/teaching/types/student.type';

describe('StudentMapper', () => {
  describe('sessionToDomain', () => {
    it('maps snake_case row to domain StudentSession', () => {
      const row: SupabaseStudentSession = {
        session_id: 's-1',
        student_id: 'st-1',
      };

      expect(StudentMapper.sessionToDomain(row)).toEqual({
        sessionId: 's-1',
        studentId: 'st-1',
      });
    });

    it('maps an array of rows via mapList', () => {
      const rows: SupabaseStudentSession[] = [
        { session_id: 's-1', student_id: 'a' },
        { session_id: 's-2', student_id: 'b' },
      ];

      expect(mapList(rows, StudentMapper.sessionToDomain)).toEqual([
        { sessionId: 's-1', studentId: 'a' },
        { sessionId: 's-2', studentId: 'b' },
      ]);
    });
  });

  describe('courseStatToDomain', () => {
    it('maps a student course stats row', () => {
      const row: SupabaseStudentCourseStats = {
        student_id: 'stu-1',
        attempted_questions: 10,
        correct_answers: 8,
        last_attempt_at: '2026-01-01T12:00:00.000Z',
        students: {
          id: 'stu-1',
          name: 'Alice',
          email: 'alice@school.com',
          photo_url: 'https://x/a.png',
        },
      };

      expect(StudentMapper.courseStatToDomain(row)).toEqual({
        studentId: 'stu-1',
        attemptedQuestions: 10,
        correctAnswers: 8,
        lastAttemptAt: '2026-01-01T12:00:00.000Z',
        student: {
          id: 'stu-1',
          name: 'Alice',
          email: 'alice@school.com',
          photoUrl: 'https://x/a.png',
        },
      });
    });

    it('returns empty array via mapList for empty input', () => {
      expect(mapList([], StudentMapper.courseStatToDomain)).toEqual([]);
    });

    it('maps multiple rows correctly via mapList', () => {
      const rows: SupabaseStudentCourseStats[] = [
        {
          student_id: 'stu-1',
          attempted_questions: 5,
          correct_answers: 3,
          last_attempt_at: '2026-01-01T10:00:00.000Z',
          students: { id: 'stu-1', name: 'Bob', email: 'bob@x.com', photo_url: '' },
        },
        {
          student_id: 'stu-2',
          attempted_questions: 0,
          correct_answers: 0,
          last_attempt_at: '2026-01-02T00:00:00.000Z',
          students: { id: 'stu-2', name: 'Eve', email: 'eve@x.com', photo_url: 'https://x/e.png' },
        },
      ];

      const result = mapList(rows, StudentMapper.courseStatToDomain);

      expect(result).toHaveLength(2);
      expect(result[0].student.name).toBe('Bob');
      expect(result[0].student.photoUrl).toBe('');
      expect(result[1].student.photoUrl).toBe('https://x/e.png');
    });
  });

  describe('joinedSessionToDomain', () => {
    const baseRow: SupabaseStudentJoinedSession = {
      joined_at: '2026-01-15T10:00:00.000Z',
      sessions: {
        id: 'session-1',
        teacher_id: 'teacher-1',
        name: 'Session de maths',
        code: 'ABC123',
        language: 'francais',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    };

    it('maps a row to a flat StudentJoinedSession', () => {
      expect(mapList([baseRow], StudentMapper.joinedSessionToDomain)).toEqual([
        {
          id: 'session-1',
          teacherId: 'teacher-1',
          name: 'Session de maths',
          code: 'ABC123',
          language: 'francais',
          createdAt: '2026-01-01T00:00:00.000Z',
          joinedAt: '2026-01-15T10:00:00.000Z',
        },
      ]);
    });

    it('returns an empty array for empty input', () => {
      expect(mapList([], StudentMapper.joinedSessionToDomain)).toEqual([]);
    });

    it('maps multiple rows preserving order', () => {
      const rows: SupabaseStudentJoinedSession[] = [
        {
          joined_at: '2026-02-01T00:00:00.000Z',
          sessions: {
            id: 'session-2',
            teacher_id: 'teacher-1',
            name: "Session d'anglais",
            code: 'XYZ789',
            language: 'anglais',
            created_at: '2026-01-05T00:00:00.000Z',
          },
        },
        baseRow,
      ];

      const result = mapList(rows, StudentMapper.joinedSessionToDomain);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('session-2');
      expect(result[0].joinedAt).toBe('2026-02-01T00:00:00.000Z');
      expect(result[1].id).toBe('session-1');
    });
  });
});
