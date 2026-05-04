import { UpdateQuestionByIdUseCase } from './update-question-by-id.use-case';
import { AuthUser } from '../../domain/auth/types/auth.type';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../domain/shared/global/errors/global.errors';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { QuestionsRepository } from '../../domain/teaching/interface/questions.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { Question } from '../../domain/teaching/types/question.type';

describe('UpdateQuestionByIdUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when question is not found', async () => {
    fixtures.whenQuestionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.teachersRepository.getTeacherByUserId,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.coursesRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when course is not found', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when course belongs to another teacher', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).not.toHaveBeenCalled();
  });

  it('should update and return the question when all checks pass', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenUpdateSucceeds();

    const result = await fixtures.whenExecute({
      questionText: 'Nouveau texte',
    });

    expect(result).toEqual(fixtures.updatedQuestion);
    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).toHaveBeenCalledWith(fixtures.questionId, {
      questionText: 'Nouveau texte',
    });
  });

  it('should set default proposals and correctAnswers when type is single', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenUpdateSucceeds();

    await fixtures.whenExecute({ type: 'single' });

    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).toHaveBeenCalledWith(fixtures.questionId, {
      type: 'single',
      proposals: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswers: ['Option A'],
    });
  });

  it('should set default proposals and correctAnswers when type is multiple', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenUpdateSucceeds();

    await fixtures.whenExecute({ type: 'multiple' });

    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).toHaveBeenCalledWith(fixtures.questionId, {
      type: 'multiple',
      proposals: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswers: ['Option A'],
    });
  });

  it('should set propositions and correctAnswers to null when type is open', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenUpdateSucceeds();

    await fixtures.whenExecute({ type: 'open' });

    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).toHaveBeenCalledWith(
      fixtures.questionId,
      expect.objectContaining({ type: 'open', correctAnswers: null }),
    );
  });

  it('should override default proposals when type and proposals are both provided', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenUpdateSucceeds();

    await fixtures.whenExecute({
      type: 'single',
      proposals: ['X', 'Y'],
      correctAnswers: ['X'],
    });

    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).toHaveBeenCalledWith(fixtures.questionId, {
      type: 'single',
      proposals: ['X', 'Y'],
      correctAnswers: ['X'],
    });
  });

  it('should only include provided fields when no type is given', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenUpdateSucceeds();

    await fixtures.whenExecute({
      explanation: 'Parce que',
    });

    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).toHaveBeenCalledWith(fixtures.questionId, { explanation: 'Parce que' });
  });

  it('should include positionOrder in updates when provided', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenUpdateSucceeds();

    await fixtures.whenExecute({ positionOrder: 3 });

    expect(
      fixtures.questionsRepository.updateQuestionById,
    ).toHaveBeenCalledWith(fixtures.questionId, { positionOrder: 3 });
  });

  it('should propagate errors thrown by updateQuestionById', async () => {
    fixtures.whenQuestionFound();
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionMatchesTeacher();
    fixtures.whenUpdateFails();

    await expect(fixtures.whenExecute({ questionText: 'X' })).rejects.toBe(
      fixtures.repositoryError,
    );
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
    supabaseUserId: 'user-1',
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
  };

  public readonly updatedQuestion: Question = {
    ...this.question,
    questionText: 'Nouveau texte',
  };

  public readonly repositoryError = new Error('repository error');

  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly teachersRepository: jest.Mocked<TeacherRepository>;
  public readonly coursesRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: UpdateQuestionByIdUseCase;

  constructor() {
    this.questionsRepository = {
      getQuestionById: jest.fn(),
      deleteQuestionById: jest.fn(),
      insertQuestion: jest.fn(),
      insertQuestions: jest.fn(),
      deleteQuestionsByCourseIds: jest.fn(),
      getPendingQuestionCount: jest.fn(),
      getCourseQuestions: jest.fn(),
      deleteCourseQuizQuestions: jest.fn(),
      updateQuestionById: jest.fn(),
      deleteCourseQuestionsByCourseId: jest.fn(),
      getAnsweredQuestionCount: jest.fn(),
    };
    this.teachersRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
      getTeacherByConditions: jest.fn(),
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
      deleteCourseById: jest.fn(),
      updateCourse: jest.fn(),
    };

    this.useCase = new UpdateQuestionByIdUseCase(
      this.questionsRepository,
      this.coursesRepository,
      this.teachersRepository,
    );
  }

  whenExecute(body: Parameters<UpdateQuestionByIdUseCase['execute']>[1] = {}) {
    return this.useCase.execute(this.questionId, body, this.user);
  }

  whenQuestionFound() {
    this.questionsRepository.getQuestionById.mockResolvedValue(this.question);
  }

  whenQuestionNotFound() {
    this.questionsRepository.getQuestionById.mockResolvedValue(null as any);
  }

  whenTeacherFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenCourseSessionMatchesTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: this.teacher.id },
    } as any);
  }

  whenCourseNotFound() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue(
      null as any,
    );
  }

  whenCourseSessionBelongsToOtherTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher' },
    } as any);
  }

  whenUpdateSucceeds() {
    this.questionsRepository.updateQuestionById.mockResolvedValue(
      this.updatedQuestion,
    );
  }

  whenUpdateFails() {
    this.questionsRepository.updateQuestionById.mockRejectedValue(
      this.repositoryError,
    );
  }
}
