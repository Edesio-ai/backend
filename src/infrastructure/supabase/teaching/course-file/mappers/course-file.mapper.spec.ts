import { CourseFileMapper } from './course-file.mapper';

describe('CourseFileMapper', () => {
  describe('fileUrlsToDomain', () => {
    it('maps file_url to fileUrl', () => {
      expect(
        CourseFileMapper.fileUrlsToDomain([
          { file_url: 'a.pdf' },
          { file_url: 'b.pdf' },
        ]),
      ).toEqual([{ fileUrl: 'a.pdf' }, { fileUrl: 'b.pdf' }]);
    });

    it('returns empty array for empty input', () => {
      expect(CourseFileMapper.fileUrlsToDomain([])).toEqual([]);
    });
  });
});
