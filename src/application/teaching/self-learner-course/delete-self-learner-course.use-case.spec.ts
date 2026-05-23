import {
  ForbiddenError,
  NotFoundError,
  ServerError,
} from 'src/domain/shared/errors/global.errors';
import { DeleteSelfLearnerCourseUseCase } from './delete-self-learner-course.use-case';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import type { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockSelfLearnerCourseFileRepository } from 'src/testing/mock-self-learner-course-file-repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerQuestionRepository } from 'src/testing/mock-self-learner-question-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';

describe('DeleteSelfLearnerCourseUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('deletes storage files then rows then course when urls exist', async () => {
    fixtures.whenOwnershipOk();
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFilesUrls.mockResolvedValue(
      ['a/x.pdf', 'a/y.pdf'],
    );

    await fixtures.whenExecute();

    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).toHaveBeenCalledTimes(2);
    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).toHaveBeenCalledWith('a/x.pdf');
    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).toHaveBeenCalledWith('a/y.pdf');
    expect(
      fixtures.selfLearnerCourseFileRepository
        .deleteSelfLearnerCourseFilesByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.questionRepository.deleteSelfLearnerQuestionsByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.courseRepository.deleteSelfLearnerCourse,
    ).toHaveBeenCalledWith(fixtures.courseId);
  });

  it('skips storage deletes when no file urls', async () => {
    fixtures.whenOwnershipOk();
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFilesUrls.mockResolvedValue(
      [],
    );

    await fixtures.whenExecute();

    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).not.toHaveBeenCalled();
    expect(
      fixtures.selfLearnerCourseFileRepository
        .deleteSelfLearnerCourseFilesByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.courseRepository.deleteSelfLearnerCourse,
    ).toHaveBeenCalledWith(fixtures.courseId);
  });

  it('throws NotFoundError when self learner missing', async () => {
    fixtures.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(
      null,
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.courseRepository.deleteSelfLearnerCourse,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when course missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepository.getSelfLearnerCourseById.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.courseRepository.deleteSelfLearnerCourse,
    ).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when course belongs to someone else', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepository.getSelfLearnerCourseById.mockResolvedValue({
      ...fixtures.course,
      selfLearnerId: 'other',
    });

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.courseRepository.deleteSelfLearnerCourse,
    ).not.toHaveBeenCalled();
  });

  it('propagates storage delete failures', async () => {
    fixtures.whenOwnershipOk();
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFilesUrls.mockResolvedValue(
      ['f1'],
    );
    const err = new Error('storage');
    fixtures.courseFileRepository.deleteFileFromStorage.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
    expect(
      fixtures.courseRepository.deleteSelfLearnerCourse,
    ).not.toHaveBeenCalled();
  });

  it('propagates when listing file urls fails', async () => {
    fixtures.whenOwnershipOk();
    const err = new ServerError('listing');
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFilesUrls.mockRejectedValue(
      err,
    );

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });

  it('does not delete course row when learner file mapping delete fails', async () => {
    fixtures.whenOwnershipOk();
    const err = new ServerError('fk');
    fixtures.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFilesByCourseId.mockRejectedValue(
      err,
    );

    await expect(fixtures.whenExecute()).rejects.toBe(err);
    expect(
      fixtures.courseRepository.deleteSelfLearnerCourse,
    ).not.toHaveBeenCalled();
  });

  it('does not delete course row when learner questions delete fails', async () => {
    fixtures.whenOwnershipOk();
    const err = new ServerError('q');
    fixtures.questionRepository.deleteSelfLearnerQuestionsByCourseId.mockRejectedValue(
      err,
    );

    await expect(fixtures.whenExecute()).rejects.toBe(err);
    expect(
      fixtures.courseRepository.deleteSelfLearnerCourse,
    ).not.toHaveBeenCalled();
  });

  it('runs storage deletes then mappings, questions and course deletes', async () => {
    const order: string[] = [];
    fixtures.whenOwnershipOk();
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFilesUrls.mockResolvedValue(
      ['a.pdf', 'b.pdf'],
    );
    fixtures.courseFileRepository.deleteFileFromStorage.mockImplementation(
      async () => {
        order.push('storage');
      },
    );
    fixtures.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFilesByCourseId.mockImplementation(
      async () => {
        order.push('files');
      },
    );
    fixtures.questionRepository.deleteSelfLearnerQuestionsByCourseId.mockImplementation(
      async () => {
        order.push('questions');
      },
    );
    fixtures.courseRepository.deleteSelfLearnerCourse.mockImplementation(
      async () => {
        order.push('course');
      },
    );

    await fixtures.whenExecute();

    expect(order).toEqual([
      'storage',
      'storage',
      'files',
      'questions',
      'course',
    ]);
  });
});

class Fixtures {
  public readonly userId = 'auth-1';
  public readonly courseId = 'c-del';

  public readonly learner = {
    id: 'sl-1',
    supabaseUserId: this.userId,
    name: 'A',
    email: 'a@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly course = {
    id: this.courseId,
    selfLearnerId: this.learner.id,
    title: 'T',
    description: null as string | null,
    textContent: null as string | null,
    language: 'francais' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly courseRepository: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly selfLearnerRepository: jest.Mocked<ISelfLearnerRepository>;
  public readonly selfLearnerCourseFileRepository: jest.Mocked<ISelfLearnerCourseFileRepository>;
  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly questionRepository: jest.Mocked<ISelfLearnerQuestionRepository>;

  public readonly useCase: DeleteSelfLearnerCourseUseCase;

  constructor() {
    this.courseRepository = createMockSelfLearnerCourseRepository();
    this.selfLearnerRepository = createMockSelfLearnerRepository();
    this.selfLearnerCourseFileRepository =
      createMockSelfLearnerCourseFileRepository();
    this.courseFileRepository = createMockCourseFileRepository();
    this.questionRepository = createMockSelfLearnerQuestionRepository();

    this.useCase = new DeleteSelfLearnerCourseUseCase(
      this.courseRepository,
      this.selfLearnerRepository,
      this.selfLearnerCourseFileRepository,
      this.courseFileRepository,
      this.questionRepository,
    );

    this.selfLearnerCourseFileRepository.getSelfLearnerCourseFilesUrls.mockResolvedValue(
      [],
    );
    this.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFilesByCourseId.mockResolvedValue(
      undefined,
    );
    this.questionRepository.deleteSelfLearnerQuestionsByCourseId.mockResolvedValue(
      undefined,
    );
    this.courseRepository.deleteSelfLearnerCourse.mockResolvedValue(undefined);
    this.courseFileRepository.deleteFileFromStorage.mockResolvedValue(
      undefined,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.courseId);
  }

  whenLearnerExists() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(
      this.learner,
    );
  }

  whenOwnershipOk() {
    this.whenLearnerExists();
    this.courseRepository.getSelfLearnerCourseById.mockResolvedValue(
      this.course,
    );
  }
}
