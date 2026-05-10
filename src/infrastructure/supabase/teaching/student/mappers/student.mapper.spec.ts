import { StudentMapper } from './student.mapper';
import type {
  InsertStudent,
  SupabaseStudent,
} from 'src/domain/teaching/student/type/student.type';

describe('StudentMapper', () => {
  const supabaseRow: SupabaseStudent = {
    id: 'stu-1',
    supabase_user_id: 'user-1',
    name: 'Alice',
    email: 'alice@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    photo_url: 'https://x/p.png',
  };

  describe('toDomain', () => {
    it('maps snake_case Supabase row to Student', () => {
      expect(StudentMapper.toDomain(supabaseRow)).toEqual({
        id: 'stu-1',
        supabaseUserId: 'user-1',
        name: 'Alice',
        email: 'alice@school.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        photoUrl: 'https://x/p.png',
      });
    });
  });

  describe('toInsert', () => {
    it('maps InsertStudent to SupabaseStudentInsert', () => {
      const body: InsertStudent = {
        supabaseUserId: 'user-1',
        name: 'Bob',
        email: 'bob@school.com',
      };
      expect(StudentMapper.toInsert(body)).toEqual({
        supabase_user_id: 'user-1',
        name: 'Bob',
        email: 'bob@school.com',
      });
    });
  });
});
