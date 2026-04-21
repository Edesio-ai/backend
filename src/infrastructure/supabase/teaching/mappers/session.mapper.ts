import {
  CreateSessionBody,
  Session,
  SupabaseSession,
  UpdateSessionNameBody,
} from 'src/domain/teaching/types/session.type';
import {
  SupabaseCourseWithSession,
  CourseWithSession,
} from 'src/domain/teaching/types/course.type';

type SupabaseSessionInsert = {
  teacher_id: string;
  name: string;
  code: string;
  language: string;
};

export function createSessionBodyToSupabaseSessionInsert(
  body: CreateSessionBody,
): SupabaseSessionInsert {
  return {
    teacher_id: body.teacherId,
    name: body.name,
    code: body.code,
    language: body.language,
  };
}

export function updateSessionNameBodyToSupabaseSessionUpdate(
  body: UpdateSessionNameBody,
): { name: string } {
  return { name: body.name };
}

export function supabaseSessionToSession(row: SupabaseSession): Session {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    code: row.code,
    language: row.language,
    createdAt: row.created_at,
  };
}

export function supabaseCourseWithSessionToCourseWithSession(
  row: SupabaseCourseWithSession,
): CourseWithSession {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    contentText: row.content_text,
    validatedQuestions: row.validated_questions,
    positionOrder: row.position_order,
    session: {
      id: row.session?.id ?? '',
      teacherId: row.session?.teacher_id ?? '',
      name: row.session?.name ?? '',
      code: row.session?.code ?? '',
      language: row.session?.language ?? 'francais',
      createdAt: row.session?.created_at ?? '',
    },
  };
}
