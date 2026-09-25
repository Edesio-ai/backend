import { DeleteQuestionByIdUseCase } from './delete-question-by-id.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Question } from 'src/domain/teaching/question/types/question.type';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockQuestionsRepository } from 'src/testing/mock-questions-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('DeleteQuestionByIdUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw BadRequestError when questionId is empty', async () => {
    await expect(fixtures.whenExecuteWithId('')).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.questionsRepository.getQuestionById).not.toHaveBeenCalled();
  });

  it('should propagate error when getQuestionById fails', async () => {
    fixtures.whenGetQuestionByIdFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);
    expect(fixtures.teachersRepository.getTeacherByUserId).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.coursesRepository.getCourseWithSessionById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when course is not found', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.questionsRepository.deleteQuestionById).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when course belongs to another teacher', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fixtures.questionsRepository.deleteQuestionById).not.toHaveBeenCalled();
  });

  it('should delete the question and return true when teacher owns the course', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenDeleteQuestionByIdSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toBe(true);
    expect(fixtures.questionsRepository.deleteQuestionById).toHaveBeenCalledWith(fixtures.questionId);
  });
});

class Fixtures {
  public readonly questionId = 'q-1';
  public readonly courseId = 'course-1';

  public readonly user: AuthUser = {
    id: 'user-1',
    email: 't@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly teacher = {
    id: 'teacher-1',
    name: 'Prof',
    email: 't@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null as string | null,
    availableChatbots: 0,
    supabaseUserId: this.user.id,
  };

  public readonly question: Question = {
    id: this.questionId,
    courseId: this.courseId,
    type: 'multiple',
    questionText: 'Q ?',
    proposals: ['A', 'B'],
    correctAnswers: ['A'],
    explanation: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    positionOrder: 1,
    cheatingDetectionEnabled: true,
  };

  public readonly repositoryError = new Error('repository error');

  public readonly questionsRepository: jest.Mocked<IQuestionsRepository>;
  public readonly teachersRepository: jest.Mocked<ITeacherRepository>;
  public readonly coursesRepository: jest.Mocked<ICourseRepository>;
  public readonly useCase: DeleteQuestionByIdUseCase;

  constructor() {
    this.questionsRepository = createMockQuestionsRepository();
    this.teachersRepository = createMockTeacherRepository();
    this.coursesRepository = createMockCourseRepository();

    this.useCase = new DeleteQuestionByIdUseCase(
      this.questionsRepository,
      this.coursesRepository,
      this.teachersRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.questionId, this.user);
  }

  whenExecuteWithId(id: string) {
    return this.useCase.execute(id, this.user);
  }

  whenQuestionFound() {
    this.questionsRepository.getQuestionById.mockResolvedValue(this.question);
  }

  whenGetQuestionByIdFails() {
    this.questionsRepository.getQuestionById.mockRejectedValue(this.repositoryError);
  }

  whenTeacherFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenCourseSessionMatchesTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: this.teacher.id },
      teachers: {},
    });
  }

  whenCourseNotFound() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue(null);
  }

  whenCourseSessionBelongsToOtherTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher' },
      teachers: {},
    });
  }

  whenDeleteQuestionByIdSucceeds() {
    this.questionsRepository.deleteQuestionById.mockResolvedValue(undefined);
  }
}
