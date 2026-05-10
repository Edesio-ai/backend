import { GetCourseFilesUseCase } from './get-course-files.use-case';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { CourseFile } from 'src/domain/teaching/course/types/course.type';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';

describe('GetCourseFilesUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return course files from repository', async () => {
    fixtures.whenRepositoryReturnsFiles();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.courseFiles);
    expect(
      fixtures.courseFileRepository.getCourseFilesByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.courseFileRepository.getCourseFilesByCourseId,
    ).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    fixtures.whenRepositoryThrows();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBe(fixtures.repositoryError);
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly repositoryError = new Error('files query failed');

  public readonly courseFiles: CourseFile[] = [
    {
      id: 'f-1',
      courseId: this.courseId,
      fileUrl: 'path/a.pdf',
      fileName: 'a.pdf',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly useCase: GetCourseFilesUseCase;

  constructor() {
    this.courseFileRepository = createMockCourseFileRepository();

    this.useCase = new GetCourseFilesUseCase(this.courseFileRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.courseId);
  }

  whenRepositoryReturnsFiles() {
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue(
      this.courseFiles,
    );
  }

  whenRepositoryThrows() {
    this.courseFileRepository.getCourseFilesByCourseId.mockRejectedValue(
      this.repositoryError,
    );
  }
}
