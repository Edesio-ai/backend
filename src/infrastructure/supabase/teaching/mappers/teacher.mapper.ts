import {
  SupabaseTeacher,
  SupabaseTeacherSession,
  Teacher,
  TeacherSession,
} from 'src/domain/teaching/types/teacher.type';

type SupabaseTeacherInsert = {
  supabase_user_id: string;
  name: string;
  email: string;
  establishment_id?: string | null;
  available_chatbots?: number;
};

export function createTeacherInsertPayload(
  userId: string,
  name: string,
  email: string,
): SupabaseTeacherInsert {
  return {
    supabase_user_id: userId,
    name,
    email: email || '',
  };
}

export function createTeacherWithEstablishmentInsertPayload(
  userId: string,
  name: string,
  email: string,
  establishmentId: string,
  availableChatbots: number,
): SupabaseTeacherInsert {
  return {
    supabase_user_id: userId,
    name,
    email: email.toLowerCase().trim(),
    establishment_id: establishmentId,
    available_chatbots: availableChatbots,
  };
}

export function linkTeacherEstablishmentUpdatePayload(
  establishmentId: string,
): { establishment_id: string } {
  return { establishment_id: establishmentId };
}

export function supabaseTeacherToTeacher(row: SupabaseTeacher): Teacher {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    establishmentId: row.establishment_id,
    availableChatbots: row.available_chatbots,
    supabaseUserId: row.supabase_user_id ?? undefined,
  };
}

export function supabaseTeacherSessionToTeacherSession(
  row: SupabaseTeacherSession,
): TeacherSession {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    language: row.language,
    teacherId: row.teacher_id,
    createdAt: row.created_at,
  };
}

export function supabaseTeacherSessionsToTeacherSessions(
  rows: SupabaseTeacherSession[],
): TeacherSession[] {
  return rows.map(supabaseTeacherSessionToTeacherSession);
}

export function conditionToSupabaseCondition(
  conditions: Partial<Record<'id' | 'establishmentId' | 'teacherId', string>>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(conditions).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(),
      value,
    ]),
  );
}
