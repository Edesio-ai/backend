import { NotFoundException } from '@nestjs/common';
import { ExportCourseFileUseCase } from './export-course-file.use-case';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';

describe('ExportCourseFileUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundException when file is not found', async () => {
    fixtures.whenGetCourseFileByIdReturnsNull();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.courseFileRepository.getFileBufferFromStorage,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when buffer is not found in storage', async () => {
    fixtures.whenGetCourseFileByIdSucceeds();
    fixtures.whenGetFileBufferReturnsNull();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should return buffer and fileName on success', async () => {
    fixtures.whenGetCourseFileByIdSucceeds();
    fixtures.whenGetFileBufferSucceeds();

    const result = await fixtures.whenExecute();

    expect(
      fixtures.courseFileRepository.getCourseFileById,
    ).toHaveBeenCalledWith(fixtures.fileId);
    expect(
      fixtures.courseFileRepository.getFileBufferFromStorage,
    ).toHaveBeenCalledWith(fixtures.courseFile.fileUrl);
    expect(result).toEqual({
      buffer: fixtures.buffer,
      fileName: fixtures.courseFile.fileName,
    });
  });

  it('should propagate errors thrown by getCourseFileById', async () => {
    fixtures.whenGetCourseFileByIdFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);
  });

  it('should propagate errors thrown by getFileBufferFromStorage', async () => {
    fixtures.whenGetCourseFileByIdSucceeds();
    fixtures.whenGetFileBufferFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);
  });
});

class Fixtures {
  public readonly fileId = 'file-1';

  public readonly courseFile = {
    id: this.fileId,
    courseId: 'course-1',
    fileUrl: 'course-1/doc.pdf',
    fileName: 'doc.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly buffer = Buffer.from('pdf content');
  public readonly repositoryError = new Error('repository error');

  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly useCase: ExportCourseFileUseCase;

  constructor() {
    this.courseFileRepository = createMockCourseFileRepository();
    this.useCase = new ExportCourseFileUseCase(this.courseFileRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.fileId);
  }

  whenGetCourseFileByIdSucceeds() {
    this.courseFileRepository.getCourseFileById.mockResolvedValue(
      this.courseFile,
    );
  }

  whenGetCourseFileByIdReturnsNull() {
    this.courseFileRepository.getCourseFileById.mockResolvedValue(null as any);
  }

  whenGetCourseFileByIdFails() {
    this.courseFileRepository.getCourseFileById.mockRejectedValue(
      this.repositoryError,
    );
  }

  whenGetFileBufferSucceeds() {
    this.courseFileRepository.getFileBufferFromStorage.mockResolvedValue(
      this.buffer,
    );
  }

  whenGetFileBufferReturnsNull() {
    this.courseFileRepository.getFileBufferFromStorage.mockResolvedValue(
      null as any,
    );
  }

  whenGetFileBufferFails() {
    this.courseFileRepository.getFileBufferFromStorage.mockRejectedValue(
      this.repositoryError,
    );
  }
}
