import type { SupabaseSession } from 'src/domain/teaching/session/types/session.type';
import type {
  SessionStudent,
  StudentJoinedSession,
  StudentSession,
  SupabaseSessionStudent,
  SupabaseStudentJoinedSession,
  SupabaseStudentSession,
} from 'src/domain/teaching/student-session/types/student-session.type';
import { mapList } from 'src/infrastructure/supabase/common/mapper.util';

function sessionsEmbedToList(embed: SupabaseSession | SupabaseSession[] | null): SupabaseSession[] {
  if (embed == null) {
    return [];
  }
  return Array.isArray(embed) ? embed : [embed];
}

function joinedSessionFromParts(joinedAt: string, session: SupabaseSession): StudentJoinedSession {
  return {
    id: session.id,
    teacherId: session.teacher_id,
    name: session.name,
    code: session.code,
    language: session.language,
    createdAt: session.created_at,
    joinedAt,
  };
}

function sessionStudentEmbedRowToDomain(row: SupabaseSessionStudent): SessionStudent {
  return {
    id: row.students.id,
    name: row.students.name,
    email: row.students.email,
    photoUrl: row.students.photo_url,
    joinedAt: row.joined_at,
  };
}

export const StudentSessionMapper = {
  mapEnrollmentRowsWithEmbeddedSessions(rows: SupabaseStudentJoinedSession[]): StudentJoinedSession[] {
    const out: StudentJoinedSession[] = [];
    for (const row of rows) {
      for (const session of sessionsEmbedToList(row.sessions)) {
        out.push(joinedSessionFromParts(row.joined_at, session));
      }
    }
    return out;
  },

  mapEnrollmentRowsWithEmbeddedStudents(rawRows: unknown): SessionStudent[] {
    const rows = Array.isArray(rawRows) ? rawRows : [];
    return mapList(rows as SupabaseSessionStudent[], sessionStudentEmbedRowToDomain);
  },

  toDomain: (row: SupabaseStudentSession): StudentSession => ({
    sessionId: row.session_id,
    studentId: row.student_id,
  }),
};
