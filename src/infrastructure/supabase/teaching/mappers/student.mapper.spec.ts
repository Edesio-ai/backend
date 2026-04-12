import {
  supabaseStudentSessionToStudentSession,
  supabaseStudentSessionsToStudentSessions,
} from './student.mapper';
import { SupabaseStudentSession } from 'src/domain/teaching/types/student.type';

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
});
