import { ValidateCourseQuestionsUseCase } from './validate-course-questions.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { Course } from 'src/domain/teaching/course/types/course.type';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Question } from 'src/domain/teaching/question/types/question.type';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockQuestionsRepository } from 'src/testing/mock-questions-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('ValidateCourseQuestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.courseRepository.getCourseWithSessionById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when course is not found', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when course belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFoundWithOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when course has no questions', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFound();
    fixtures.whenQuestionsEmpty();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.courseRepository.updateCourse).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when getCourseQuestions returns null', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFound();
    fixtures.whenQuestionsNull();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.courseRepository.updateCourse).not.toHaveBeenCalled();
  });

  it('should call updateCourse with validatedQuestions: true and return updated course', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseFound();
    fixtures.whenQuestionsExist();
    fixtures.whenUpdateCourseSucceeds();

    const result = await fixtures.whenExecute();

    expect(fixtures.courseRepository.updateCourse).toHaveBeenCalledWith(fixtures.courseId, {
      validatedQuestions: true,
    });
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

  public readonly validatedCourse: Course = {
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

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly questionsRepository: jest.Mocked<IQuestionsRepository>;
  public readonly useCase: ValidateCourseQuestionsUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.questionsRepository = createMockQuestionsRepository();
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
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenCourseFound() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: this.teacher.id },
      teachers: {},
    });
  }

  whenCourseFoundWithOtherTeacher() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher' },
      teachers: {},
    });
  }

  whenCourseNotFound() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue(null);
  }

  whenQuestionsExist() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue([this.question]);
  }

  whenQuestionsEmpty() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue([]);
  }

  whenQuestionsNull() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue(null);
  }

  whenUpdateCourseSucceeds() {
    this.courseRepository.updateCourse.mockResolvedValue(this.validatedCourse);
  }

  whenUpdateCourseFails() {
    this.courseRepository.updateCourse.mockRejectedValue(this.repositoryError);
  }
}
