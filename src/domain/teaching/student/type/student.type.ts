export type Student = {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: string;
  photoUrl: string;
};

export type SupabaseStudent = {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  created_at: string;
  photo_url: string;
};

export type InsertStudent = Omit<Student, 'id' | 'createdAt' | 'photoUrl'>;
export type SupabaseStudentInsert = Omit<
  SupabaseStudent,
  'id' | 'created_at' | 'photo_url'
>;
export type UpdateStudentPayload = Pick<Student, 'name' | 'email'>;

export type StudentPhotoUpload = {
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
  byteLength: number;
};
