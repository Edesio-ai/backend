import { UploadCourseFileUseCase } from 'src/application/teaching/course-file/upload-course-file.use-case';
import type { ICourseFileRepository } from 'src/domain/teaching/interfaces/i-course-file.repository';
import { CourseFileUpload } from 'src/domain/teaching/types/course.type';
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

  it('should propagate error when storeCourseFile fails', async () => {
    fixtures.whenStoreFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
    expect(
      fixtures.courseFileRepository.insertCourseFile,
    ).not.toHaveBeenCalled();
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

  public readonly insertedFile = {
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
    this.useCase = new UploadCourseFileUseCase(this.courseFileRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.file);
  }

  whenUploadAndInsertSucceed() {
    this.courseFileRepository.storeCourseFile.mockResolvedValue();
    this.courseFileRepository.insertCourseFile.mockResolvedValue(
      this.insertedFile as any,
    );
  }

  whenStoreFails() {
    this.courseFileRepository.storeCourseFile.mockRejectedValue(
      this.repositoryError,
    );
  }

  whenStoreSucceedsInsertFails() {
    this.courseFileRepository.storeCourseFile.mockResolvedValue();
    this.courseFileRepository.insertCourseFile.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenStoreCourseFileCalledWithExpectedPath() {
    const expectedPath = `${this.courseId}/1700000000000.pdf`;
    expect(this.courseFileRepository.storeCourseFile).toHaveBeenCalledWith(
      this.file,
      expectedPath,
    );
    expect(this.courseFileRepository.storeCourseFile).toHaveBeenCalledTimes(1);
  }

  thenInsertCourseFileCalledWithSamePath() {
    const expectedPath = `${this.courseId}/1700000000000.pdf`;
    expect(this.courseFileRepository.insertCourseFile).toHaveBeenCalledWith(
      this.courseId,
      this.file,
      expectedPath,
    );
    expect(this.courseFileRepository.insertCourseFile).toHaveBeenCalledTimes(1);
  }

  thenReturnInsertedFile(result: unknown) {
    expect(result).toEqual(this.insertedFile);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
