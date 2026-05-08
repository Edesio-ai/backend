import { UploadCourseFileUseCase } from 'src/application/teaching/file/upload-course-file.use-case';
import { CourseRepository } from 'src/domain/teaching/interface/course.repository';
import { CourseFileUpload } from 'src/domain/teaching/types/course.type';

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

    expect(fixtures.courseRepository.storeCourseFile).toHaveBeenCalledWith(
      fixtures.file,
      `${fixtures.courseId}/1700000000000.pdf`,
    );
  });

  it('should propagate error when storeCourseFile fails', async () => {
    fixtures.whenStoreFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
    expect(fixtures.courseRepository.insertCourseFile).not.toHaveBeenCalled();
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

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: UploadCourseFileUseCase;

  constructor() {
    this.courseRepository = {
      getCoursesBySessionId: jest.fn(),
      deleteCoursesFilesByCourseIds: jest.fn(),
      deleteCoursesBySessionId: jest.fn(),
      getSessionCoursesCount: jest.fn(),
      createCourse: jest.fn(),
      storeCourseFile: jest.fn(),
      insertCourseFile: jest.fn(),
      getCourseById: jest.fn(),
      getCourseWithSessionById: jest.fn(),
      getSessionCoursesBySessionId: jest.fn(),
      getCourseValidatedQuestions: jest.fn(),
      getCourseFilesByCourseId: jest.fn(),
      getFileBufferFromStorage: jest.fn(),
      deleteCourseById: jest.fn(),
      updateCourse: jest.fn(),
    };
    this.useCase = new UploadCourseFileUseCase(this.courseRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.file);
  }

  whenUploadAndInsertSucceed() {
    this.courseRepository.storeCourseFile.mockResolvedValue();
    this.courseRepository.insertCourseFile.mockResolvedValue(
      this.insertedFile as any,
    );
  }

  whenStoreFails() {
    this.courseRepository.storeCourseFile.mockRejectedValue(
      this.repositoryError,
    );
  }

  whenStoreSucceedsInsertFails() {
    this.courseRepository.storeCourseFile.mockResolvedValue();
    this.courseRepository.insertCourseFile.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenStoreCourseFileCalledWithExpectedPath() {
    const expectedPath = `${this.courseId}/1700000000000.pdf`;
    expect(this.courseRepository.storeCourseFile).toHaveBeenCalledWith(
      this.file,
      expectedPath,
    );
    expect(this.courseRepository.storeCourseFile).toHaveBeenCalledTimes(1);
  }

  thenInsertCourseFileCalledWithSamePath() {
    const expectedPath = `${this.courseId}/1700000000000.pdf`;
    expect(this.courseRepository.insertCourseFile).toHaveBeenCalledWith(
      this.courseId,
      this.file,
      expectedPath,
    );
    expect(this.courseRepository.insertCourseFile).toHaveBeenCalledTimes(1);
  }

  thenReturnInsertedFile(result: unknown) {
    expect(result).toEqual(this.insertedFile);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
