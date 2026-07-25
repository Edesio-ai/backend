import { selfLearnerCourseFileMapper } from './self-learner-course-file.mapper';

describe('selfLearnerCourseFileMapper', () => {
  describe('toInsert', () => {
    it('maps camelCase payload to snake_case row', () => {
      expect(
        selfLearnerCourseFileMapper.toInsert({
          courseId: 'c-1',
          fileUrl: 'self-learner/c-1/doc.pdf',
          fileName: 'doc.pdf',
        }),
      ).toEqual({
        course_id: 'c-1',
        file_url: 'self-learner/c-1/doc.pdf',
        file_name: 'doc.pdf',
      });
    });
  });

  describe('toDomain', () => {
    it('maps Supabase row to domain', () => {
      expect(
        selfLearnerCourseFileMapper.toDomain({
          id: 'scf-1',
          course_id: 'c-1',
          file_url: 'path/f.pdf',
          file_name: 'f.pdf',
          created_at: '2026-01-01T00:00:00.000Z',
        }),
      ).toEqual({
        id: 'scf-1',
        courseId: 'c-1',
        fileUrl: 'path/f.pdf',
        fileName: 'f.pdf',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('toCourseFilesUrls', () => {
    it('maps partial rows to file_url strings only', () => {
      expect(
        selfLearnerCourseFileMapper.toCourseFilesUrls([{ file_url: 'first.pdf' }, { file_url: 'second.pdf' }]),
      ).toEqual(['first.pdf', 'second.pdf']);
    });
  });
});
