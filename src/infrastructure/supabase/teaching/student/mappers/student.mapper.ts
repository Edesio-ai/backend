import {
  InsertStudent,
  Student,
  SupabaseStudent,
  SupabaseStudentInsert,
} from 'src/domain/teaching/student/type/student.type';

export const StudentMapper = {
  toDomain: (row: SupabaseStudent): Student => ({
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    photoUrl: row.photo_url,
  }),

  toInsert: (body: InsertStudent): SupabaseStudentInsert => ({
    supabase_user_id: body.supabaseUserId,
    name: body.name,
    email: body.email,
  }),
};
