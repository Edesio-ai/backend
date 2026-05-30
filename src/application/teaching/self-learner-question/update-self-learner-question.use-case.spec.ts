import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import type { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerQuestionRepository } from 'src/testing/mock-self-learner-question-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';
import { UpdateSelfLearnerQuestionUseCase } from './update-self-learner-question.use-case';

describe('UpdateSelfLearnerQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('updates and returns the question when learner owns the course', async () => {
    fixtures.whenOwnershipOk();
    fixtures.questionRepo.updateSelfLearnerQuestion.mockResolvedValue(
      fixtures.updatedQuestion,
    );

    const result = await fixtures.whenExecute();

    expect(
      fixtures.questionRepo.updateSelfLearnerQuestion,
    ).toHaveBeenCalledWith(fixtures.questionId, fixtures.body);
    expect(result).toEqual(fixtures.updatedQuestion);
  });

  it('throws NotFoundError when self learner missing', async () => {
    fixtures.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionRepo.updateSelfLearnerQuestion,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when question missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.questionRepo.getSelfLearnerQuestionById.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionRepo.updateSelfLearnerQuestion,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when course missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.whenQuestionExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionRepo.updateSelfLearnerQuestion,
    ).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when course belongs to someone else', async () => {
    fixtures.whenLearnerExists();
    fixtures.whenQuestionExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue({
      ...fixtures.course,
      selfLearnerId: 'other-sl',
    });

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.questionRepo.updateSelfLearnerQuestion,
    ).not.toHaveBeenCalled();
  });

  it('propagates errors from the question repository', async () => {
    fixtures.whenOwnershipOk();
    const err = new Error('db error');
    fixtures.questionRepo.updateSelfLearnerQuestion.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly userId = 'auth-update-1';
  public readonly questionId = 'sq-upd-1';
  public readonly courseId = 'sl-course-upd';

  public readonly learner = {
    id: 'sl-upd',
    supabaseUserId: this.userId,
    name: 'B',
    email: 'b@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly question: SelfLearnerQuestion = {
    id: this.questionId,
    courseId: this.courseId,
    type: 'single',
    questionText: 'Ancienne question ?',
    proposals: ['A', 'B'],
    correctAnswers: ['A'],
    explanation: 'expl',
    createdAt: new Date('2026-01-03T00:00:00.000Z'),
  };

  public readonly course = {
    id: this.courseId,
    selfLearnerId: this.learner.id,
    title: 'Cours update',
    description: null,
    textContent: null,
    language: 'francais' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly body = {
    questionText: 'Nouvelle question ?',
    correctAnswers: ['B'],
  };

  public readonly updatedQuestion: SelfLearnerQuestion = {
    ...this.question,
    questionText: this.body.questionText,
    correctAnswers: this.body.correctAnswers,
  };

  public readonly selfLearnerRepo: jest.Mocked<ISelfLearnerRepository>;
  public readonly courseRepo: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly questionRepo: jest.Mocked<ISelfLearnerQuestionRepository>;
  public readonly useCase: UpdateSelfLearnerQuestionUseCase;

  constructor() {
    this.selfLearnerRepo = createMockSelfLearnerRepository();
    this.courseRepo = createMockSelfLearnerCourseRepository();
    this.questionRepo = createMockSelfLearnerQuestionRepository();

    this.useCase = new UpdateSelfLearnerQuestionUseCase(
      this.questionRepo,
      this.selfLearnerRepo,
      this.courseRepo,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.questionId, this.body, {
      id: this.userId,
      email: 'b@test.com',
      metadata: { role: 'self-learner' },
    });
  }

  whenLearnerExists() {
    this.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(this.learner);
  }

  whenQuestionExists() {
    this.questionRepo.getSelfLearnerQuestionById.mockResolvedValue(
      this.question,
    );
  }

  whenOwnershipOk() {
    this.whenLearnerExists();
    this.whenQuestionExists();
    this.courseRepo.getSelfLearnerCourseById.mockResolvedValue(this.course);
  }
}
