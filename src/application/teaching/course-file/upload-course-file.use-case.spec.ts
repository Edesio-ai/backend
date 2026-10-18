import { UploadCourseFileUseCase } from 'src/application/teaching/course-file/upload-course-file.use-case';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { MAX_COURSE_FILE_BYTES, MAX_COURSE_FILES } from 'src/domain/teaching/course-file/course-file.limits';
import { CourseFile, CourseFileUpload } from 'src/domain/teaching/course-file/types/course-file.type';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';

describe('UploadCourseFileUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should upload then insert course file with derived storage path', async () => {
    fixtures.whenUploadAndInsertSucceed();

    const result = await fixtures.whenExecute();

    fixtures.thenStoreCourseFileCalledWithExpectedPath();
    fixtures.thenInsertCourseFileCalledWithSamePath();
    fixtures.thenReturnInsertedFile(result);
  });

  it('should use last segment after dot as file extension', async () => {
    fixtures.whenUploadAndInsertSucceed();
    fixtures.file.originalFileName = 'notes.final.pdf';

    await fixtures.whenExecute();

    expect(fixtures.courseFileRepository.storeCourseFile).toHaveBeenCalledWith(
      fixtures.file,
      `${fixtures.courseId}/1700000000000.pdf`,
    );
  });

  it('should throw BadRequestError when file exceeds max size', async () => {
    fixtures.file.byteLength = MAX_COURSE_FILE_BYTES + 1;

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.courseFileRepository.getCourseFilesByCourseId).not.toHaveBeenCalled();
    expect(fixtures.courseFileRepository.storeCourseFile).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when course already has max files', async () => {
    fixtures.whenCourseAlreadyHasMaxFiles();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.courseFileRepository.storeCourseFile).not.toHaveBeenCalled();
    expect(fixtures.courseFileRepository.insertCourseFile).not.toHaveBeenCalled();
  });

  it('should propagate error when storeCourseFile fails', async () => {
    fixtures.whenStoreFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
    expect(fixtures.courseFileRepository.insertCourseFile).not.toHaveBeenCalled();
  });

  it('should propagate error when insertCourseFile fails', async () => {
    fixtures.whenStoreSucceedsInsertFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public file: CourseFileUpload = {
    buffer: Buffer.from('pdf-bytes'),
    originalFileName: 'notes.pdf',
    mimeType: 'application/pdf',
    byteLength: 9,
  };

  public readonly insertedFile: CourseFile = {
    id: 'file-1',
    courseId: this.courseId,
    fileUrl: `${this.courseId}/1700000000000.pdf`,
    fileName: 'notes.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly repositoryError = new Error('storage failed');

  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly useCase: UploadCourseFileUseCase;

  constructor() {
    this.courseFileRepository = createMockCourseFileRepository();
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue([]);
    this.useCase = new UploadCourseFileUseCase(this.courseFileRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.file);
  }

  whenUploadAndInsertSucceed() {
    this.courseFileRepository.storeCourseFile.mockResolvedValue();
    this.courseFileRepository.insertCourseFile.mockResolvedValue(this.insertedFile);
  }

  whenCourseAlreadyHasMaxFiles() {
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue(
      Array.from({ length: MAX_COURSE_FILES }, (_, index) => ({
        id: `file-${index}`,
        courseId: this.courseId,
        fileUrl: `${this.courseId}/${index}.pdf`,
        fileName: `notes-${index}.pdf`,
        createdAt: '2026-01-01T00:00:00.000Z',
      })),
    );
  }

  whenStoreFails() {
    this.courseFileRepository.storeCourseFile.mockRejectedValue(this.repositoryError);
  }

  whenStoreSucceedsInsertFails() {
    this.courseFileRepository.storeCourseFile.mockResolvedValue();
    this.courseFileRepository.insertCourseFile.mockRejectedValue(this.repositoryError);
  }

  thenStoreCourseFileCalledWithExpectedPath() {
    const expectedPath = `${this.courseId}/1700000000000.pdf`;
    expect(this.courseFileRepository.storeCourseFile).toHaveBeenCalledWith(this.file, expectedPath);
    expect(this.courseFileRepository.storeCourseFile).toHaveBeenCalledTimes(1);
  }

  thenInsertCourseFileCalledWithSamePath() {
    const expectedPath = `${this.courseId}/1700000000000.pdf`;
    expect(this.courseFileRepository.insertCourseFile).toHaveBeenCalledWith(this.courseId, this.file, expectedPath);
    expect(this.courseFileRepository.insertCourseFile).toHaveBeenCalledTimes(1);
  }

  thenReturnInsertedFile(result: unknown) {
    expect(result).toEqual(this.insertedFile);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
