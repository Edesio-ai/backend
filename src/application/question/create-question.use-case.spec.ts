import {
  CreateQuestionBody,
  CreateQuestionUseCase,
} from './create-question.use-case';
import { AuthUser } from '../../domain/auth/types/auth.type';
import { UnauthorizedError } from '../../domain/shared/global/errors/global.errors';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { QuestionsRepository } from '../../domain/teaching/interface/questions.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { Question } from '../../domain/teaching/types/question.type';

describe('CreateQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw UnauthorizedError when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(
      fixtures.coursesRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
    expect(fixtures.questionsRepository.insertQuestion).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when course belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(fixtures.questionsRepository.insertQuestion).not.toHaveBeenCalled();
  });

  it('should create and return the question when teacher owns the course', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenInsertQuestionSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.createdQuestion);
    expect(fixtures.questionsRepository.insertQuestion).toHaveBeenCalledWith(
      fixtures.body,
    );
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
    type: 'multiple',
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
    type: 'multiple',
    questionText: 'Quelle est la bonne réponse ?',
    proposals: ['A', 'B', 'C', 'D'],
    correctAnswers: ['A'],
    explanation: 'Parce que A',
    createdAt: '2026-01-01T00:00:00.000Z',
    positionOrder: null,
  };

  public readonly repositoryError = new Error('repository error');

  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly teachersRepository: jest.Mocked<TeacherRepository>;
  public readonly coursesRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: CreateQuestionUseCase;

  constructor() {
    this.questionsRepository = {
      getQuestionById: jest.fn(),
      deleteQuestionById: jest.fn(),
      insertQuestion: jest.fn(),
      insertQuestions: jest.fn(),
      deleteQuestionsByCourseIds: jest.fn(),
      getPendingQuestionCount: jest.fn(),
      getCourseQuestions: jest.fn(),
      deleteCourseQuestions: jest.fn(),
      updateQuestionById: jest.fn(),
    };
    this.teachersRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
    };
    this.coursesRepository = {
      getCourseById: jest.fn(),
      getCourseWithSessionById: jest.fn(),
      getSessionCoursesBySessionId: jest.fn(),
      getCoursesBySessionId: jest.fn(),
      deleteCoursesFilesByCourseIds: jest.fn(),
      deleteCoursesBySessionId: jest.fn(),
      getSessionCoursesCount: jest.fn(),
      createCourse: jest.fn(),
      storeCourseFile: jest.fn(),
      insertCourseFile: jest.fn(),
      getCourseValidatedQuestions: jest.fn(),
      getCourseFilesByCourseId: jest.fn(),
      getFileBufferFromStorage: jest.fn(),
    };

    this.useCase = new CreateQuestionUseCase(
      this.questionsRepository,
      this.teachersRepository,
      this.coursesRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.body, this.user);
  }

  whenTeacherFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenCourseSessionMatchesTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.body.courseId,
      session: { teacherId: this.teacher.id },
    });
  }

  whenCourseSessionBelongsToOtherTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.body.courseId,
      session: { teacherId: 'other-teacher' },
    });
  }

  whenInsertQuestionSucceeds() {
    this.questionsRepository.insertQuestion.mockResolvedValue(
      this.createdQuestion,
    );
  }

  whenInsertQuestionFails() {
    this.questionsRepository.insertQuestion.mockRejectedValue(
      this.repositoryError,
    );
  }
}
