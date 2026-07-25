import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import type { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerQuestionRepository } from 'src/testing/mock-self-learner-question-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';
import { CreateSelfLearnerQuestionUseCase } from './create-self-learner-question.use-case';

describe('CreateSelfLearnerQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('creates and returns the question when learner owns the course', async () => {
    fixtures.whenOwnershipOk();

    const result = await fixtures.whenExecute();

    expect(fixtures.questionRepo.createSelfLearnerQuestion).toHaveBeenCalledWith({
      courseId: fixtures.course.id,
      type: fixtures.body.type,
      questionText: fixtures.body.questionText,
      explanation: fixtures.body.explanation,
      correctAnswers: fixtures.body.correctAnswers,
      proposals: fixtures.body.proposals,
    });
    expect(result).toEqual(fixtures.createdQuestion);
  });

  it('fills explanation with empty string when omitted', async () => {
    fixtures.whenOwnershipOk();

    await fixtures.whenExecuteWithBody({
      ...fixtures.body,
      explanation: undefined,
    });

    expect(fixtures.questionRepo.createSelfLearnerQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ explanation: '' }),
    );
  });

  it('fills proposals with empty array when omitted', async () => {
    fixtures.whenOwnershipOk();

    await fixtures.whenExecuteWithBody({
      ...fixtures.body,
      proposals: undefined,
    });

    expect(fixtures.questionRepo.createSelfLearnerQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ proposals: [] }),
    );
  });

  it('throws NotFoundError when self learner is missing', async () => {
    fixtures.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.questionRepo.createSelfLearnerQuestion).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when course is missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.questionRepo.createSelfLearnerQuestion).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when course belongs to another learner', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue({
      ...fixtures.course,
      selfLearnerId: 'other-sl',
    });

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.questionRepo.createSelfLearnerQuestion).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    fixtures.whenOwnershipOk();
    const err = new Error('db constraint');
    fixtures.questionRepo.createSelfLearnerQuestion.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly userId = 'auth-create-q';

  public readonly user: AuthUser = {
    id: this.userId,
    email: 'u@test.com',
    metadata: { role: 'self-learner' },
  };

  public readonly learner = {
    id: 'sl-1',
    supabaseUserId: this.userId,
    name: 'A',
    email: 'a@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly course = {
    id: 'c-create',
    selfLearnerId: this.learner.id,
    title: 'T',
    description: null as string | null,
    textContent: null as string | null,
    language: 'francais' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly body = {
    type: 'single' as const,
    questionText: 'Quelle est la réponse ?',
    proposals: ['A', 'B', 'C'],
    correctAnswers: ['A'],
    explanation: 'Parce que A',
  };

  public readonly createdQuestion: SelfLearnerQuestion = {
    id: 'sq-new',
    courseId: this.course.id,
    type: this.body.type,
    questionText: this.body.questionText,
    proposals: this.body.proposals,
    correctAnswers: this.body.correctAnswers,
    explanation: this.body.explanation,
    createdAt: new Date('2026-01-03T10:00:00.000Z'),
  };

  public readonly selfLearnerRepo: jest.Mocked<ISelfLearnerRepository>;
  public readonly questionRepo: jest.Mocked<ISelfLearnerQuestionRepository>;
  public readonly courseRepo: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly useCase: CreateSelfLearnerQuestionUseCase;

  constructor() {
    this.selfLearnerRepo = createMockSelfLearnerRepository();
    this.questionRepo = createMockSelfLearnerQuestionRepository();
    this.courseRepo = createMockSelfLearnerCourseRepository();

    this.useCase = new CreateSelfLearnerQuestionUseCase(this.selfLearnerRepo, this.questionRepo, this.courseRepo);

    this.questionRepo.createSelfLearnerQuestion.mockResolvedValue(this.createdQuestion);
  }

  whenExecute() {
    return this.useCase.execute(this.course.id, this.body, this.user);
  }

  whenExecuteWithBody(
    body: Omit<typeof this.body, 'proposals' | 'explanation'> & {
      proposals?: string[];
      explanation?: string;
    },
  ) {
    return this.useCase.execute(this.course.id, body, this.user);
  }

  whenLearnerExists() {
    this.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(this.learner);
  }

  whenOwnershipOk() {
    this.whenLearnerExists();
    this.courseRepo.getSelfLearnerCourseById.mockResolvedValue(this.course);
  }
}
