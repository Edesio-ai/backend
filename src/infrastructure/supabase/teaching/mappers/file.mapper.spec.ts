import { FileMapper } from './file.mapper';
import { SupabaseCourseFile } from 'src/domain/teaching/types/course.type';

describe('FileMapper', () => {
  describe('toDomain', () => {
    it('maps all fields from a Supabase row to a domain CourseFile', () => {
      const row: SupabaseCourseFile = {
        id: 'f-1',
        course_id: 'c-1',
        file_url: 'c-1/doc.pdf',
        file_name: 'doc.pdf',
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(FileMapper.toDomain(row)).toEqual({
        id: 'f-1',
        courseId: 'c-1',
        fileUrl: 'c-1/doc.pdf',
        fileName: 'doc.pdf',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('preserves null-like values as-is', () => {
      const row: SupabaseCourseFile = {
        id: 'f-2',
        course_id: 'c-2',
        file_url: '',
        file_name: '',
        created_at: '',
      };

      expect(FileMapper.toDomain(row)).toEqual({
        id: 'f-2',
        courseId: 'c-2',
        fileUrl: '',
        fileName: '',
        createdAt: '',
      });
    });
  });
});
