import { GetCourseFilesUseCase } from './get-course-files.use-case';
import { CourseRepository } from 'src/domain/teaching/interface/course.repository';
import { CourseFile } from 'src/domain/teaching/types/course.type';

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
      fixtures.courseRepository.getCourseFilesByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.courseRepository.getCourseFilesByCourseId,
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

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: GetCourseFilesUseCase;

  constructor() {
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

    this.useCase = new GetCourseFilesUseCase(this.courseRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.courseId);
  }

  whenRepositoryReturnsFiles() {
    this.courseRepository.getCourseFilesByCourseId.mockResolvedValue(
      this.courseFiles,
    );
  }

  whenRepositoryThrows() {
    this.courseRepository.getCourseFilesByCourseId.mockRejectedValue(
      this.repositoryError,
    );
  }
}
