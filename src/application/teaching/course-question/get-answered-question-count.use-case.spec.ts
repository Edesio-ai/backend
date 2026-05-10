import { GetAnsweredQuestionCountUseCase } from 'src/application/teaching/course-question/get-answered-question-count.use-case';
import { StudentRepository } from 'src/domain/teaching/interfaces/student.repository';
import type { ICourseQuestionRepository } from 'src/domain/teaching/interfaces/i-course-question.repository';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Student } from 'src/domain/teaching/types/student.type';
import { createMockCourseQuestionRepository } from 'src/testing/mock-course-question-repository';
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
      fixtures.courseQuestionRepository.getAnsweredQuestionCount,
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
      fixtures.courseQuestionRepository.getAnsweredQuestionCount,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from the course question repository', async () => {
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

  public readonly courseQuestionRepository: jest.Mocked<ICourseQuestionRepository>;
  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: GetAnsweredQuestionCountUseCase;

  constructor() {
    this.courseQuestionRepository = createMockCourseQuestionRepository();
    this.studentRepository = createMockStudentRepository();
    this.useCase = new GetAnsweredQuestionCountUseCase(
      this.courseQuestionRepository,
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
    this.courseQuestionRepository.getAnsweredQuestionCount.mockResolvedValue(
      count,
    );
  }

  whenCountFails() {
    this.courseQuestionRepository.getAnsweredQuestionCount.mockRejectedValue(
      new Error('count failed'),
    );
  }
}
