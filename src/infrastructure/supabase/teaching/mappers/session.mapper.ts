import {
  CreateSessionBody,
  Session,
  SupabaseSession,
  UpdateSessionNameBody,
} from 'src/domain/teaching/types/session.type';
import {
  CourseWithSession,
  SupabaseCourseWithSession,
} from 'src/domain/teaching/types/course.type';

type SupabaseSessionInsert = {
  teacher_id: string;
  name: string;
  code: string;
  language: string;
};

export const SessionMapper = {
  toDomain: (row: SupabaseSession): Session => ({
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    code: row.code,
    language: row.language,
    createdAt: row.created_at,
  }),

  toInsert: (body: CreateSessionBody): SupabaseSessionInsert => ({
    teacher_id: body.teacherId,
    name: body.name,
    code: body.code,
    language: body.language,
  }),

  toUpdate: (body: UpdateSessionNameBody): { name: string } => ({
    name: body.name,
  }),

  courseWithSessionToDomain: (row: SupabaseCourseWithSession): CourseWithSession => ({
    id: row.id,
    title: row.title,
    description: row.description,
    contentText: row.content_text,
    validatedQuestions: row.validated_questions,
    positionOrder: row.position_order,
    session: {
      id: row.sessions?.id ?? '',
      teacherId: row.sessions?.teacher_id ?? '',
      name: row.sessions?.name ?? '',
      code: row.sessions?.code ?? '',
      language: row.sessions?.language ?? 'francais',
      createdAt: row.sessions?.created_at ?? '',
    },
    teachers: {
      id: row.sessions?.teachers?.id ?? '',
      name: row.sessions?.teachers?.name ?? '',
      email: row.sessions?.teachers?.email ?? '',
      createdAt: row.sessions?.teachers?.created_at ?? '',
      establishmentId: row.sessions?.teachers?.establishment_id ?? '',
    },
  }),
};
