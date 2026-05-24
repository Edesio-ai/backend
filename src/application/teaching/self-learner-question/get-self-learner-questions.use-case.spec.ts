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
import { GetSelfLearnerQuestionsUseCase } from './get-self-learner-questions.use-case';

describe('GetSelfLearnerQuestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('returns questions when learner owns the course', async () => {
    fixtures.whenOwnershipOk();

    const result = await fixtures.whenExecute();

    expect(fixtures.questionRepo.getSelfLearnerQuestions).toHaveBeenCalledWith(
      fixtures.courseId,
    );
    expect(result).toEqual(fixtures.questions);
  });

  it('throws NotFoundError when self learner missing', async () => {
    fixtures.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionRepo.getSelfLearnerQuestions,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when course missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue(null);

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionRepo.getSelfLearnerQuestions,
    ).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when course belongs to someone else', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue({
      ...fixtures.course,
      selfLearnerId: 'other-sl',
    });

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.questionRepo.getSelfLearnerQuestions,
    ).not.toHaveBeenCalled();
  });

  it('propagates errors from question repository', async () => {
    fixtures.whenOwnershipOk();
    const err = new Error('storage');
    fixtures.questionRepo.getSelfLearnerQuestions.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly userId = 'auth-questions-1';
  public readonly courseId = 'sl-course-q';

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
    title: 'Cours perso',
    description: null,
    textContent: null,
    language: 'francais' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly questions: SelfLearnerQuestion[] = [
    {
      id: 'sq-1',
      courseId: this.courseId,
      type: 'single',
      questionText: '?',
      proposals: ['x'],
      correctAnswers: ['x'],
      explanation: 'e',
      createdAt: new Date('2026-01-03T00:00:00.000Z'),
    },
  ];

  public readonly courseRepo: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly questionRepo: jest.Mocked<ISelfLearnerQuestionRepository>;
  public readonly selfLearnerRepo: jest.Mocked<ISelfLearnerRepository>;
  public readonly useCase: GetSelfLearnerQuestionsUseCase;

  constructor() {
    this.courseRepo = createMockSelfLearnerCourseRepository();
    this.questionRepo = createMockSelfLearnerQuestionRepository();
    this.selfLearnerRepo = createMockSelfLearnerRepository();

    this.useCase = new GetSelfLearnerQuestionsUseCase(
      this.courseRepo,
      this.questionRepo,
      this.selfLearnerRepo,
    );

    this.questionRepo.getSelfLearnerQuestions.mockResolvedValue(this.questions);
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.courseId);
  }

  whenLearnerExists() {
    this.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(this.learner);
  }

  whenOwnershipOk() {
    this.whenLearnerExists();
    this.courseRepo.getSelfLearnerCourseById.mockResolvedValue(this.course);
  }
}
