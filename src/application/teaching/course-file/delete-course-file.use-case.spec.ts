import { DeleteCourseFileUseCase } from './delete-course-file.use-case';
import { FileRepository } from 'src/domain/teaching/interface/file.repository';

describe('DeleteCourseFileUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call deleteFileById with the expected fileId', async () => {
    fixtures.whenDeleteFileSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.fileRepository.deleteFileById).toHaveBeenCalledWith(
      fixtures.fileId,
    );
    expect(fixtures.fileRepository.deleteFileById).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors thrown by deleteFileById', async () => {
    fixtures.whenDeleteFileFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);
  });
});

class Fixtures {
  public readonly fileId = 'file-1';
  public readonly repositoryError = new Error('delete failed');

  public readonly fileRepository: jest.Mocked<FileRepository>;
  public readonly useCase: DeleteCourseFileUseCase;

  constructor() {
    this.fileRepository = {
      deleteFileById: jest.fn(),
      getCourseFileById: jest.fn(),
      getCourseFilesByCourseId: jest.fn(),
    };
    this.useCase = new DeleteCourseFileUseCase(this.fileRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.fileId);
  }

  whenDeleteFileSucceeds() {
    this.fileRepository.deleteFileById.mockResolvedValue(undefined);
  }

  whenDeleteFileFails() {
    this.fileRepository.deleteFileById.mockRejectedValue(this.repositoryError);
  }
}
