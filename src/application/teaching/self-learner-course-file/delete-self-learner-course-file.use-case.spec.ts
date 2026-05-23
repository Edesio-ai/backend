import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import type { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockSelfLearnerCourseFileRepository } from 'src/testing/mock-self-learner-course-file-repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';
import { DeleteSelfLearnerCourseFileUseCase } from './delete-self-learner-course-file.use-case';

describe('DeleteSelfLearnerCourseFileUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('removes blob then deletes learner course file row', async () => {
    fixtures.whenPipelineReady();

    await fixtures.whenExecute();

    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).toHaveBeenCalledWith(fixtures.fileRow.fileUrl);
    expect(
      fixtures.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFileById,
    ).toHaveBeenCalledWith(fixtures.fileId);
  });

  it('does not touch DB delete when storage delete fails', async () => {
    fixtures.whenPipelineReady();
    const err = new Error('storage');
    fixtures.courseFileRepository.deleteFileFromStorage.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
    expect(
      fixtures.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFileById,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when self learner missing', async () => {
    fixtures.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(
      null,
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when learner course file row missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFileById.mockResolvedValue(
      null as never,
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when parent course missing', async () => {
    fixtures.whenFileAndLearnerExist();
    fixtures.selfLearnerCourseRepository.getSelfLearnerCourseById.mockResolvedValue(
      null,
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when course belongs to another learner', async () => {
    fixtures.whenFileAndLearnerExist();
    fixtures.selfLearnerCourseRepository.getSelfLearnerCourseById.mockResolvedValue(
      {
        ...fixtures.course,
        selfLearnerId: 'someone-else',
      },
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.courseFileRepository.deleteFileFromStorage,
    ).not.toHaveBeenCalled();
  });

  it('runs storage delete before learner file row delete', async () => {
    const order: string[] = [];
    fixtures.whenPipelineReady();
    fixtures.courseFileRepository.deleteFileFromStorage.mockImplementation(
      async () => {
        order.push('storage');
      },
    );
    fixtures.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFileById.mockImplementation(
      async () => {
        order.push('db');
      },
    );

    await fixtures.whenExecute();

    expect(order).toEqual(['storage', 'db']);
  });
});

class Fixtures {
  public readonly userId = 'auth-1';
  public readonly fileId = 'scf-del-1';

  public readonly learner = {
    id: 'sl-1',
    supabaseUserId: this.userId,
    name: 'A',
    email: 'a@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly fileRow = {
    id: this.fileId,
    courseId: 'c-own',
    fileUrl: 'self-learner/c-own/note.pdf',
    fileName: 'note.pdf',
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly course = {
    id: this.fileRow.courseId,
    selfLearnerId: this.learner.id,
    title: 'T',
    description: null as string | null,
    textContent: null as string | null,
    language: 'francais' as const,
    createdAt: '2026-01-03T00:00:00.000Z',
  };

  public readonly selfLearnerCourseFileRepository: jest.Mocked<ISelfLearnerCourseFileRepository>;
  public readonly selfLearnerRepository: jest.Mocked<ISelfLearnerRepository>;
  public readonly selfLearnerCourseRepository: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly useCase: DeleteSelfLearnerCourseFileUseCase;

  constructor() {
    this.selfLearnerCourseFileRepository =
      createMockSelfLearnerCourseFileRepository();
    this.selfLearnerRepository = createMockSelfLearnerRepository();
    this.selfLearnerCourseRepository = createMockSelfLearnerCourseRepository();
    this.courseFileRepository = createMockCourseFileRepository();

    this.useCase = new DeleteSelfLearnerCourseFileUseCase(
      this.selfLearnerCourseFileRepository,
      this.selfLearnerRepository,
      this.selfLearnerCourseRepository,
      this.courseFileRepository,
    );

    this.courseFileRepository.deleteFileFromStorage.mockResolvedValue(
      undefined,
    );
    this.selfLearnerCourseFileRepository.deleteSelfLearnerCourseFileById.mockResolvedValue(
      undefined,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.fileId);
  }

  whenLearnerExists() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(
      this.learner,
    );
  }

  whenFileAndLearnerExist() {
    this.whenLearnerExists();
    this.selfLearnerCourseFileRepository.getSelfLearnerCourseFileById.mockResolvedValue(
      this.fileRow,
    );
    this.selfLearnerCourseRepository.getSelfLearnerCourseById.mockResolvedValue(
      this.course,
    );
  }

  whenPipelineReady() {
    this.whenFileAndLearnerExist();
  }
}
