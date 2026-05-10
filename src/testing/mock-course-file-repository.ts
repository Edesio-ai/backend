import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';

export function createMockCourseFileRepository(): jest.Mocked<ICourseFileRepository> {
  return {
    deleteFileById: jest.fn(),
    getCourseFileById: jest.fn(),
    deleteCoursesFilesByCourseIds: jest.fn(),
    getCourseFilesByCourseId: jest.fn(),
    getFileBufferFromStorage: jest.fn(),
    insertCourseFile: jest.fn(),
    storeCourseFile: jest.fn(),
  };
}
