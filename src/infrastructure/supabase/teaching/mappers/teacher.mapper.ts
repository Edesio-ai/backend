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

export const TeacherMapper = {
  toDomain: (row: SupabaseTeacher): Teacher => ({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    establishmentId: row.establishment_id,
    availableChatbots: row.available_chatbots,
    supabaseUserId: row.supabase_user_id ?? undefined,
  }),

  sessionToDomain: (row: SupabaseTeacherSession): TeacherSession => ({
    id: row.id,
    name: row.name,
    code: row.code,
    language: row.language,
    teacherId: row.teacher_id,
    createdAt: row.created_at,
  }),

  toInsert: (
    userId: string,
    name: string,
    email: string,
  ): SupabaseTeacherInsert => ({
    supabase_user_id: userId,
    name,
    email: email || '',
  }),

  toInsertWithEstablishment: (
    userId: string,
    name: string,
    email: string,
    establishmentId: string,
    availableChatbots: number,
  ): SupabaseTeacherInsert => ({
    supabase_user_id: userId,
    name,
    email: email.toLowerCase().trim(),
    establishment_id: establishmentId,
    available_chatbots: availableChatbots,
  }),

  toEstablishmentUpdate: (
    establishmentId: string,
  ): { establishment_id: string } => ({
    establishment_id: establishmentId,
  }),

  toCondition: (
    conditions: Partial<Record<'id' | 'establishmentId' | 'teacherId', string>>,
  ): Record<string, string> =>
    Object.fromEntries(
      Object.entries(conditions).map(([key, value]) => [
        key.replace(/([A-Z])/g, '_$1').toLowerCase(),
        value,
      ]),
    ),
};
