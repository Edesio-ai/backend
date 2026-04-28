import {
  supabaseStudentSessionToStudentSession,
  supabaseStudentSessionsToStudentSessions,
  supabaseStudentCourseStatsToStudentCourseStats,
} from './student.mapper';
import {
  SupabaseStudentSession,
  SupabaseStudentCourseStats,
} from 'src/domain/teaching/types/student.type';

describe('student.mapper', () => {
  describe('supabaseStudentSessionToStudentSession', () => {
    it('maps snake_case row to domain StudentSession', () => {
      const row: SupabaseStudentSession = {
        session_id: 's-1',
        student_id: 'st-1',
      };

      expect(supabaseStudentSessionToStudentSession(row)).toEqual({
        sessionId: 's-1',
        studentId: 'st-1',
      });
    });
  });

  describe('supabaseStudentSessionsToStudentSessions', () => {
    it('maps an array of rows', () => {
      const rows: SupabaseStudentSession[] = [
        { session_id: 's-1', student_id: 'a' },
        { session_id: 's-2', student_id: 'b' },
      ];

      expect(supabaseStudentSessionsToStudentSessions(rows)).toEqual([
        { sessionId: 's-1', studentId: 'a' },
        { sessionId: 's-2', studentId: 'b' },
      ]);
    });
  });

  describe('supabaseStudentCourseStatsToStudentCourseStats', () => {
    it('maps an array of student course stats rows', () => {
      const rows: SupabaseStudentCourseStats[] = [
        {
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
        },
      ];

      expect(supabaseStudentCourseStatsToStudentCourseStats(rows)).toEqual([
        {
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
        },
      ]);
    });

    it('returns empty array for empty input', () => {
      expect(supabaseStudentCourseStatsToStudentCourseStats([])).toEqual([]);
    });

    it('maps multiple rows correctly', () => {
      const rows: SupabaseStudentCourseStats[] = [
        {
          student_id: 'stu-1',
          attempted_questions: 5,
          correct_answers: 3,
          last_attempt_at: '2026-01-01T10:00:00.000Z',
          students: {
            id: 'stu-1',
            name: 'Bob',
            email: 'bob@x.com',
            photo_url: null,
          },
        },
        {
          student_id: 'stu-2',
          attempted_questions: 0,
          correct_answers: 0,
          last_attempt_at: '2026-01-02T00:00:00.000Z',
          students: {
            id: 'stu-2',
            name: 'Eve',
            email: 'eve@x.com',
            photo_url: 'https://x/e.png',
          },
        },
      ];

      const result = supabaseStudentCourseStatsToStudentCourseStats(rows);

      expect(result).toHaveLength(2);
      expect(result[0].student.name).toBe('Bob');
      expect(result[1].student.photoUrl).toBe('https://x/e.png');
    });
  });
});
