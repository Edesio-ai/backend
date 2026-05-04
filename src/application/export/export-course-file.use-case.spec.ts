import { NotFoundException } from '@nestjs/common';
import { ExportCourseFileUseCase } from './export-course-file.use-case';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { FileRepository } from '../../domain/teaching/interface/file.repository';
import { PdfExtractor } from '../../domain/pdf/contracts/pdf-extractor.interface';

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
      fixtures.courseRepository.getFileBufferFromStorage,
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

    expect(fixtures.fileRepository.getCourseFileById).toHaveBeenCalledWith(
      fixtures.fileId,
    );
    expect(
      fixtures.courseRepository.getFileBufferFromStorage,
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

  public readonly pdfExtractor: jest.Mocked<PdfExtractor>;
  public readonly fileRepository: jest.Mocked<FileRepository>;
  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: ExportCourseFileUseCase;

  constructor() {
    this.pdfExtractor = {
      extractTextFromPdf: jest.fn(),
      extractQuestionsToPdf: jest.fn(),
    };
    this.fileRepository = {
      deleteFileById: jest.fn(),
      getCourseFileById: jest.fn(),
      getCourseFilesByCourseId: jest.fn(),
    };
    this.courseRepository = {
      getCourseById: jest.fn(),
      getCourseWithSessionById: jest.fn(),
      getSessionCoursesBySessionId: jest.fn(),
      getCoursesBySessionId: jest.fn(),
      deleteCoursesFilesByCourseIds: jest.fn(),
      deleteCoursesBySessionId: jest.fn(),
      getSessionCoursesCount: jest.fn(),
      createCourse: jest.fn(),
      storeCourseFile: jest.fn(),
      insertCourseFile: jest.fn(),
      getCourseValidatedQuestions: jest.fn(),
      getCourseFilesByCourseId: jest.fn(),
      getFileBufferFromStorage: jest.fn(),
      deleteCourseById: jest.fn(),
      updateCourse: jest.fn(),
    };
    this.useCase = new ExportCourseFileUseCase(
      this.pdfExtractor,
      this.fileRepository,
      this.courseRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.fileId);
  }

  whenGetCourseFileByIdSucceeds() {
    this.fileRepository.getCourseFileById.mockResolvedValue(this.courseFile);
  }

  whenGetCourseFileByIdReturnsNull() {
    this.fileRepository.getCourseFileById.mockResolvedValue(null as any);
  }

  whenGetCourseFileByIdFails() {
    this.fileRepository.getCourseFileById.mockRejectedValue(
      this.repositoryError,
    );
  }

  whenGetFileBufferSucceeds() {
    this.courseRepository.getFileBufferFromStorage.mockResolvedValue(
      this.buffer,
    );
  }

  whenGetFileBufferReturnsNull() {
    this.courseRepository.getFileBufferFromStorage.mockResolvedValue(
      null as any,
    );
  }

  whenGetFileBufferFails() {
    this.courseRepository.getFileBufferFromStorage.mockRejectedValue(
      this.repositoryError,
    );
  }
}
