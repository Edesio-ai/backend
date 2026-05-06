import { GetAnsweredQuestionCountUseCase } from './get-answered-question-count.use-case';
import { QuestionsRepository } from '../../domain/teaching/interface/questions.repository';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';
import { NotFoundError } from '../../domain/shared/global/errors/global.errors';
import { AuthUser } from '../../domain/auth/types/auth.type';
import { Student } from '../../domain/teaching/types/student.type';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';

describe('GetAnsweredQuestionCountUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return the answered question count for the authenticated student', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCountReturns(42);

    const result = await fixtures.whenExecute();

    expect(result).toBe(42);
    expect(
      fixtures.questionsRepository.getAnsweredQuestionCount,
    ).toHaveBeenCalledWith(fixtures.student.id);
  });

  it('should return 0 when the student has no answered questions', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCountReturns(0);

    const result = await fixtures.whenExecute();

    expect(result).toBe(0);
  });

  it('should throw NotFoundError when student is not found', async () => {
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionsRepository.getAnsweredQuestionCount,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from the questions repository', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCountFails();

    await expect(fixtures.whenExecute()).rejects.toThrow('count failed');
  });

  it('should propagate errors from the student repository', async () => {
    fixtures.whenStudentRepositoryFails();

    await expect(fixtures.whenExecute()).rejects.toThrow('student repo failed');
  });
});

class Fixtures {
  public readonly userId = 'user-1';

  public readonly user: AuthUser = {
    id: this.userId,
    email: 'alice@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'student' },
  };

  public readonly student: Student = {
    id: 'student-1',
    supabaseUserId: this.userId,
    name: 'Alice Dupont',
    email: 'alice@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: GetAnsweredQuestionCountUseCase;

  constructor() {
    this.questionsRepository = {
      getQuestionById: jest.fn(),
      deleteQuestionById: jest.fn(),
      insertQuestions: jest.fn(),
      deleteQuestionsByCourseIds: jest.fn(),
      getPendingQuestionCount: jest.fn(),
      getCourseQuestions: jest.fn(),
      deleteCourseQuizQuestions: jest.fn(),
      insertQuestion: jest.fn(),
      updateQuestionById: jest.fn(),
      deleteCourseQuestionsByCourseId: jest.fn(),
      getAnsweredQuestionCount: jest.fn(),
    };
    this.studentRepository = createMockStudentRepository();
    this.useCase = new GetAnsweredQuestionCountUseCase(
      this.questionsRepository,
      this.studentRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.user);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.student);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenStudentRepositoryFails() {
    this.studentRepository.getStudentByUserId.mockRejectedValue(
      new Error('student repo failed'),
    );
  }

  whenCountReturns(count: number) {
    this.questionsRepository.getAnsweredQuestionCount.mockResolvedValue(count);
  }

  whenCountFails() {
    this.questionsRepository.getAnsweredQuestionCount.mockRejectedValue(
      new Error('count failed'),
    );
  }
}
