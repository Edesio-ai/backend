import { UploadSelfLearnerCourseFileUseCase } from './upload-self-learner-course-file.use-case';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { CourseFileUpload } from 'src/domain/teaching/course-file/types/course-file.type';
import type { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockSelfLearnerCourseFileRepository } from 'src/testing/mock-self-learner-course-file-repository';

describe('UploadSelfLearnerCourseFileUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores file then inserts self-learner course file row', async () => {
    fixtures.whenPipelineSucceeds();

    const result = await fixtures.whenExecute();

    expect(fixtures.courseFileRepository.storeCourseFile).toHaveBeenCalledWith(
      fixtures.file,
      `self-learner/${fixtures.courseId}/1700000000000.pdf`,
    );
    expect(fixtures.selfLearnerCourseFileRepository.uploadSelfLearnerCourseFile).toHaveBeenCalledWith({
      courseId: fixtures.courseId,
      fileUrl: `self-learner/${fixtures.courseId}/1700000000000.pdf`,
      fileName: fixtures.file.originalFileName,
    });
    expect(result).toEqual(fixtures.inserted);
  });

  it('uses bin extension when original name has none', async () => {
    fixtures.whenPipelineSucceeds();
    fixtures.file.originalFileName = 'readme';

    await fixtures.whenExecute();

    expect(fixtures.courseFileRepository.storeCourseFile).toHaveBeenCalledWith(
      fixtures.file,
      `self-learner/${fixtures.courseId}/1700000000000.bin`,
    );
  });

  it('propagates error when storeCourseFile fails', async () => {
    const err = new Error('storage down');
    fixtures.courseFileRepository.storeCourseFile.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
    expect(fixtures.selfLearnerCourseFileRepository.uploadSelfLearnerCourseFile).not.toHaveBeenCalled();
  });

  it('propagates error when DB insert fails', async () => {
    fixtures.courseFileRepository.storeCourseFile.mockResolvedValue(undefined);
    const err = new Error('duplicate');
    fixtures.selfLearnerCourseFileRepository.uploadSelfLearnerCourseFile.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly courseId = 'sl-course-1';
  public readonly file: CourseFileUpload = {
    buffer: Buffer.from('pdf'),
    originalFileName: 'notes.pdf',
    mimeType: 'application/pdf',
    byteLength: 3,
  };

  public readonly inserted = {
    id: 'scf-1',
    courseId: this.courseId,
    fileUrl: `self-learner/${this.courseId}/1700000000000.pdf`,
    fileName: 'notes.pdf',
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly selfLearnerCourseFileRepository: jest.Mocked<ISelfLearnerCourseFileRepository>;
  public readonly useCase: UploadSelfLearnerCourseFileUseCase;

  constructor() {
    this.courseFileRepository = createMockCourseFileRepository();
    this.selfLearnerCourseFileRepository = createMockSelfLearnerCourseFileRepository();

    this.useCase = new UploadSelfLearnerCourseFileUseCase(
      this.selfLearnerCourseFileRepository,
      this.courseFileRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.file);
  }

  whenPipelineSucceeds() {
    this.courseFileRepository.storeCourseFile.mockResolvedValue(undefined);
    this.selfLearnerCourseFileRepository.uploadSelfLearnerCourseFile.mockResolvedValue(this.inserted);
  }
}
