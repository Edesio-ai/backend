import type { FileRepository } from 'src/domain/teaching/interfaces/file.repository';

export function createMockFileRepository(): jest.Mocked<FileRepository> {
  return {
    deleteFileById: jest.fn(),
    getCourseFileById: jest.fn(),
    getCourseFilesByCourseId: jest.fn(),
  };
}
