import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import type { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerQuestionRepository } from 'src/testing/mock-self-learner-question-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';
import { DeleteSelfLearnerQuestionUseCase } from './delete-self-learner-question.use-case';

describe('DeleteSelfLearnerQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('deletes the question when learner owns the course', async () => {
    fixtures.whenOwnershipOk();
    fixtures.questionRepo.deleteSelfLearnerQuestionById.mockResolvedValue();

    await fixtures.whenExecute();

    expect(fixtures.questionRepo.deleteSelfLearnerQuestionById).toHaveBeenCalledWith(fixtures.questionId);
  });

  it('throws NotFoundError when self learner missing', async () => {
    fixtures.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.questionRepo.deleteSelfLearnerQuestionById).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when question missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.questionRepo.getSelfLearnerQuestionById.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.questionRepo.deleteSelfLearnerQuestionById).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when course missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.whenQuestionExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.questionRepo.deleteSelfLearnerQuestionById).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when course belongs to someone else', async () => {
    fixtures.whenLearnerExists();
    fixtures.whenQuestionExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue({
      ...fixtures.course,
      selfLearnerId: 'other-sl',
    });

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.questionRepo.deleteSelfLearnerQuestionById).not.toHaveBeenCalled();
  });

  it('propagates errors from the question repository', async () => {
    fixtures.whenOwnershipOk();
    const err = new Error('db error');
    fixtures.questionRepo.deleteSelfLearnerQuestionById.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly userId = 'auth-delete-q-1';
  public readonly questionId = 'sq-del-1';
  public readonly courseId = 'sl-course-del-q';

  public readonly learner = {
    id: 'sl-del-q',
    supabaseUserId: this.userId,
    name: 'C',
    email: 'c@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly question: SelfLearnerQuestion = {
    id: this.questionId,
    courseId: this.courseId,
    type: 'single',
    questionText: 'Question à supprimer ?',
    proposals: ['A', 'B'],
    correctAnswers: ['A'],
    explanation: 'expl',
    createdAt: new Date('2026-01-03T00:00:00.000Z'),
  };

  public readonly course = {
    id: this.courseId,
    selfLearnerId: this.learner.id,
    title: 'Cours delete question',
    description: null,
    textContent: null,
    language: 'francais' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly selfLearnerRepo: jest.Mocked<ISelfLearnerRepository>;
  public readonly courseRepo: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly questionRepo: jest.Mocked<ISelfLearnerQuestionRepository>;
  public readonly useCase: DeleteSelfLearnerQuestionUseCase;

  constructor() {
    this.selfLearnerRepo = createMockSelfLearnerRepository();
    this.courseRepo = createMockSelfLearnerCourseRepository();
    this.questionRepo = createMockSelfLearnerQuestionRepository();

    this.useCase = new DeleteSelfLearnerQuestionUseCase(this.questionRepo, this.courseRepo, this.selfLearnerRepo);
  }

  whenExecute() {
    return this.useCase.execute(
      {
        id: this.userId,
        email: 'c@test.com',
        metadata: { role: 'self-learner' },
      },
      this.questionId,
    );
  }

  whenLearnerExists() {
    this.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(this.learner);
  }

  whenQuestionExists() {
    this.questionRepo.getSelfLearnerQuestionById.mockResolvedValue(this.question);
  }

  whenOwnershipOk() {
    this.whenLearnerExists();
    this.whenQuestionExists();
    this.courseRepo.getSelfLearnerCourseById.mockResolvedValue(this.course);
  }
}
