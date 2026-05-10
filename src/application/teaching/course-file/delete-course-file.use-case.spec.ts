import { DeleteCourseFileUseCase } from './delete-course-file.use-case';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';

describe('DeleteCourseFileUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call deleteFileById with the expected fileId', async () => {
    fixtures.whenDeleteFileSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.courseFileRepository.deleteFileById).toHaveBeenCalledWith(
      fixtures.fileId,
    );
    expect(fixtures.courseFileRepository.deleteFileById).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should propagate errors thrown by deleteFileById', async () => {
    fixtures.whenDeleteFileFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);
  });
});

class Fixtures {
  public readonly fileId = 'file-1';
  public readonly repositoryError = new Error('delete failed');

  public readonly courseFileRepository = createMockCourseFileRepository();
  public readonly useCase: DeleteCourseFileUseCase;

  constructor() {
    this.useCase = new DeleteCourseFileUseCase(this.courseFileRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.fileId);
  }

  whenDeleteFileSucceeds() {
    this.courseFileRepository.deleteFileById.mockResolvedValue(undefined);
  }

  whenDeleteFileFails() {
    this.courseFileRepository.deleteFileById.mockRejectedValue(
      this.repositoryError,
    );
  }
}
