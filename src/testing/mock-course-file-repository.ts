import type { ICourseFileRepository } from 'src/domain/teaching/interfaces/i-course-file.repository';

export function createMockCourseFileRepository(): jest.Mocked<ICourseFileRepository> {
  return {
    deleteCoursesFilesByCourseIds: jest.fn(),
    getCourseFilesByCourseId: jest.fn(),
    getFileBufferFromStorage: jest.fn(),
    insertCourseFile: jest.fn(),
    storeCourseFile: jest.fn(),
  };
}
