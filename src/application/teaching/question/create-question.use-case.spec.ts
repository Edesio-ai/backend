import { CreateQuestionBody, CreateQuestionUseCase } from './create-question.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Question } from 'src/domain/teaching/question/types/question.type';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockQuestionsRepository } from 'src/testing/mock-questions-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('CreateQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw UnauthorizedError when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fixtures.coursesRepository.getCourseWithSessionById).not.toHaveBeenCalled();
    expect(fixtures.questionsRepository.insertQuestion).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when course belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fixtures.questionsRepository.insertQuestion).not.toHaveBeenCalled();
  });

  it('should create and return the question when teacher owns the course', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenInsertQuestionSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.createdQuestion);
    expect(fixtures.questionsRepository.insertQuestion).toHaveBeenCalledWith(fixtures.body);
  });

  it('should propagate errors from questionsRepository', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenInsertQuestionFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);
  });
});

class Fixtures {
  public readonly body: CreateQuestionBody = {
    courseId: 'course-1',
    type: 'single',
    questionText: 'Quelle est la bonne réponse ?',
    proposals: ['A', 'B', 'C', 'D'],
    correctAnswers: ['A'],
    explanation: 'Parce que A',
  };

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

  public readonly createdQuestion: Question = {
    id: 'q-1',
    courseId: this.body.courseId,
    type: 'single',
    questionText: 'Quelle est la bonne réponse ?',
    proposals: ['A', 'B', 'C', 'D'],
    correctAnswers: ['A'],
    explanation: 'Parce que A',
    createdAt: '2026-01-01T00:00:00.000Z',
    positionOrder: null,
    cheatingDetectionEnabled: true,
  };

  public readonly repositoryError = new Error('repository error');

  public readonly questionsRepository: jest.Mocked<IQuestionsRepository>;
  public readonly teachersRepository: jest.Mocked<ITeacherRepository>;
  public readonly coursesRepository: jest.Mocked<ICourseRepository>;
  public readonly useCase: CreateQuestionUseCase;

  constructor() {
    this.questionsRepository = createMockQuestionsRepository();
    this.teachersRepository = createMockTeacherRepository();
    this.coursesRepository = createMockCourseRepository();

    this.useCase = new CreateQuestionUseCase(this.questionsRepository, this.teachersRepository, this.coursesRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.body, this.user);
  }

  whenTeacherFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenCourseSessionMatchesTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.body.courseId,
      session: { teacherId: this.teacher.id },
      teachers: {},
    });
  }

  whenCourseSessionBelongsToOtherTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.body.courseId,
      session: { teacherId: 'other-teacher' },
      teachers: {},
    });
  }

  whenInsertQuestionSucceeds() {
    this.questionsRepository.insertQuestion.mockResolvedValue(this.createdQuestion);
  }

  whenInsertQuestionFails() {
    this.questionsRepository.insertQuestion.mockRejectedValue(this.repositoryError);
  }
}
