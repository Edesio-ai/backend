import { ValidateCourseQuestionsUseCase } from './validate-course-questions.use-case';
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

describe('ValidateCourseQuestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.courseRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when course is not found', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when course belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFoundWithOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when course has no questions', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFound();
    fixtures.whenQuestionsEmpty();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(fixtures.courseRepository.updateCourse).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when getCourseQuestions returns null', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFound();
    fixtures.whenQuestionsNull();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(fixtures.courseRepository.updateCourse).not.toHaveBeenCalled();
  });

  it('should call updateCourse with validatedQuestions: true and return updated course', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFound();
    fixtures.whenQuestionsExist();
    fixtures.whenUpdateCourseSucceeds();

    const result = await fixtures.whenExecute();

    expect(fixtures.courseRepository.updateCourse).toHaveBeenCalledWith(
      fixtures.courseId,
      { validatedQuestions: true },
    );
    expect(fixtures.courseRepository.updateCourse).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fixtures.validatedCourse);
  });

  it('should propagate errors thrown by updateCourse', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFound();
    fixtures.whenQuestionsExist();
    fixtures.whenUpdateCourseFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);
  });
});

class Fixtures {
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
    id: 'q-1',
    courseId: this.courseId,
    type: 'multiple',
    questionText: 'Q ?',
    proposals: ['A', 'B'],
    correctAnswers: ['A'],
    explanation: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    positionOrder: 1,
  };

  public readonly validatedCourse = {
    id: this.courseId,
    sessionId: 'session-1',
    title: 'Cours',
    description: null,
    contentText: null,
    validatedQuestions: true,
    positionOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly repositoryError = new Error('update failed');

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly useCase: ValidateCourseQuestionsUseCase;

  constructor() {
    this.courseRepository = {
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
    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
    };
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
    };
    this.useCase = new ValidateCourseQuestionsUseCase(
      this.courseRepository,
      this.teacherRepository,
      this.questionsRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.user);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenCourseFound() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: this.teacher.id },
    } as any);
  }

  whenCourseFoundWithOtherTeacher() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher' },
    } as any);
  }

  whenCourseNotFound() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue(
      null as any,
    );
  }

  whenQuestionsExist() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue([
      this.question,
    ]);
  }

  whenQuestionsEmpty() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue([]);
  }

  whenQuestionsNull() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue(null as any);
  }

  whenUpdateCourseSucceeds() {
    this.courseRepository.updateCourse.mockResolvedValue(
      this.validatedCourse as any,
    );
  }

  whenUpdateCourseFails() {
    this.courseRepository.updateCourse.mockRejectedValue(this.repositoryError);
  }
}
