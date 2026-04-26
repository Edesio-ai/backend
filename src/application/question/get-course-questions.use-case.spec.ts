import { GetCourseQuestionsUseCase } from './get-course-questions.use-case';
import { AuthUser } from '../../domain/auth/types/auth.type';
import { ForbiddenError } from '../../domain/shared/global/errors/global.errors';
import {
  CourseNotFoundError,
  TeacherNotFoundError,
} from '../../domain/teaching/error';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { QuestionsRepository } from '../../domain/teaching/interface/questions.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { CourseWithSession } from '../../domain/teaching/types/course.type';
import { Question } from '../../domain/teaching/types/question.type';

describe('GetCourseQuestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return course questions when teacher owns the course session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenQuestionsReturned();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.questions);
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).toHaveBeenCalledTimes(1);
  });

  it('should throw TeacherNotFoundError when teacher is missing', async () => {
    fixtures.whenTeacherNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(TeacherNotFoundError);
    expect(
      fixtures.coursesRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should throw CourseNotFoundError when course is missing', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(CourseNotFoundError);
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when session teacher does not match', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionBelongsToAnotherTeacher();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from questions repository', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenQuestionsFail();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBe(fixtures.questionsError);
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
    supabaseUserId: this.user.id,
  };

  public readonly courseWithSession: CourseWithSession = {
    id: this.courseId,
    session: { teacherId: this.teacher.id },
  };

  public readonly questions: Question[] = [
    {
      id: 'q-1',
      courseId: this.courseId,
      type: 'single',
      questionText: 'Question 1 ?',
      proposals: ['A', 'B'],
      correctAnswers: ['A'],
      explanation: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      positionOrder: 1,
    },
  ];

  public readonly questionsError = new Error('questions query failed');

  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly teachersRepository: jest.Mocked<TeacherRepository>;
  public readonly coursesRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: GetCourseQuestionsUseCase;

  constructor() {
    this.questionsRepository = {
      getQuestionById: jest.fn(),
      deleteQuestionById: jest.fn(),
      deleteQuestionsByCourseIds: jest.fn(),
      getPendingQuestionCount: jest.fn(),
      getCourseQuestions: jest.fn(),
      insertQuestions: jest.fn(),
      insertQuestion: jest.fn(),
      deleteCourseQuizQuestions: jest.fn(),
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
      getFileBufferFromStorage: jest.fn(),
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
    };

    this.useCase = new GetCourseQuestionsUseCase(
      this.questionsRepository,
      this.teachersRepository,
      this.coursesRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.user);
  }

  whenTeacherFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenCourseWithSessionMatchesTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue(
      this.courseWithSession,
    );
  }

  whenCourseNotFound() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue(
      null as any,
    );
  }

  whenCourseSessionBelongsToAnotherTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher' },
    });
  }

  whenQuestionsReturned() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue(
      this.questions,
    );
  }

  whenQuestionsFail() {
    this.questionsRepository.getCourseQuestions.mockRejectedValue(
      this.questionsError,
    );
  }
}
