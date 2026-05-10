import { courseFileMapper } from './course-file.mapper';
import { SupabaseCourseFile } from 'src/domain/teaching/types/course.type';

describe('courseFileMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toDomain', () => {
    it('maps all fields from a Supabase row to a domain CourseFile', () => {
      const result = fixtures.whenToDomainFullRow();

      fixtures.thenReturnsExpectedCourseFile(result);
    });

    it('preserves null-like values as-is', () => {
      const result = fixtures.whenToDomainSparseRow();

      fixtures.thenReturnsExpectedCourseFileSparse(result);
    });
  });
});

class Fixtures {
  public readonly fullSupabaseRow: SupabaseCourseFile = {
    id: 'f-1',
    course_id: 'c-1',
    file_url: 'c-1/doc.pdf',
    file_name: 'doc.pdf',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedCourseFile = {
    id: 'f-1',
    courseId: 'c-1',
    fileUrl: 'c-1/doc.pdf',
    fileName: 'doc.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly sparseSupabaseRow: SupabaseCourseFile = {
    id: 'f-2',
    course_id: 'c-2',
    file_url: '',
    file_name: '',
    created_at: '',
  };

  public readonly expectedCourseFileSparse = {
    id: 'f-2',
    courseId: 'c-2',
    fileUrl: '',
    fileName: '',
    createdAt: '',
  };

  whenToDomainFullRow() {
    return courseFileMapper.toDomain(this.fullSupabaseRow);
  }

  whenToDomainSparseRow() {
    return courseFileMapper.toDomain(this.sparseSupabaseRow);
  }

  thenReturnsExpectedCourseFile(result: unknown) {
    expect(result).toEqual(this.expectedCourseFile);
  }

  thenReturnsExpectedCourseFileSparse(result: unknown) {
    expect(result).toEqual(this.expectedCourseFileSparse);
  }
}
