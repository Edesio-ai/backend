import { Session, SupabaseSession } from 'src/domain/teaching/session/types/session.type';
import { SupabaseTeacher, Teacher, SupabaseTeacherInsert } from 'src/domain/teaching/teacher/types/teacher.type';
import { SessionMapper } from 'src/infrastructure/supabase/teaching/session/mappers/session.mapper';

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

  sessionToDomain: (row: SupabaseSession): Session => SessionMapper.toDomain(row),

  toInsert: (userId: string, name: string, email: string): SupabaseTeacherInsert => ({
    supabase_user_id: userId,
    name,
    email: email || '',
  }),

  toEstablishmentUpdate: (establishmentId: string): { establishment_id: string } => ({
    establishment_id: establishmentId,
  }),

  toCondition: (conditions: Partial<Record<'id' | 'establishmentId' | 'teacherId', string>>): Record<string, string> =>
    Object.fromEntries(
      Object.entries(conditions).map(([key, value]) => [key.replace(/([A-Z])/g, '_$1').toLowerCase(), value]),
    ),
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
};
