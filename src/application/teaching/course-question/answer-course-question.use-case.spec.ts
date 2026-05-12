import { NotFoundException } from '@nestjs/common';
import { AnswerCourseQuestionUseCase } from 'src/application/teaching/course-question/answer-course-question.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { ICourseQuestionRepository } from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import { CourseQuestion } from 'src/domain/teaching/course-question/types/course-question.type';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { Course } from 'src/domain/teaching/course/types/course.type';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { Session } from 'src/domain/teaching/session/types/session.type';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Teacher } from 'src/domain/teaching/teacher/types/teacher.type';
import { AnswerCourseQuestionBodyDto } from 'src/presentation/teaching/course-questions/dtos/answer-course-question.dto';
import { createMockCourseQuestionRepository } from 'src/testing/mock-course-question-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('AnswerCourseQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue(fixtures.answeredAtIso);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update course question when teacher exists and chain resolves', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseReturned();
    fixtures.whenSessionReturned();
    fixtures.whenCourseQuestionsNonEmpty();
    fixtures.whenUpdateSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.updatedCourseQuestion);
    expect(fixtures.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(
      fixtures.teacherUser.id,
    );
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionByCourseId,
    ).toHaveBeenCalledWith(fixtures.body.courseQuestionId);
    expect(fixtures.courseRepository.getCourseById).toHaveBeenCalledWith(
      fixtures.courseQuestion.courseId,
    );
    expect(fixtures.sessionRepository.getSessionById).toHaveBeenCalledWith(
      fixtures.course.sessionId,
    );
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionsByCourseId,
    ).toHaveBeenCalledWith(fixtures.course.id);
    expect(
      fixtures.courseQuestionRepository.updateCourseQuestion,
    ).toHaveBeenCalledWith(fixtures.body.courseQuestionId, {
      answer: fixtures.body.answer,
      answeredAt: fixtures.answeredAtIso,
    });
  });

  it('should throw NotFoundException when teacher is missing', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionByCourseId,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when course question is missing', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(fixtures.courseRepository.getCourseById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when course is missing', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseMissing();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(fixtures.sessionRepository.getSessionById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when session is missing', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseReturned();
    fixtures.whenSessionMissing();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionsByCourseId,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when no course questions exist for course', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseReturned();
    fixtures.whenSessionReturned();
    fixtures.whenCourseQuestionsEmpty();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.courseQuestionRepository.updateCourseQuestion,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from updateCourseQuestion', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseReturned();
    fixtures.whenSessionReturned();
    fixtures.whenCourseQuestionsNonEmpty();
    fixtures.whenUpdateFails();

    await expect(fixtures.whenExecute()).rejects.toBe(
      fixtures.updateCourseQuestionError,
    );
  });
});

class Fixtures {
  public readonly courseQuestionId = '550e8400-e29b-41d4-a716-446655440001';
  public readonly courseId = '550e8400-e29b-41d4-a716-446655440002';
  public readonly sessionId = '550e8400-e29b-41d4-a716-446655440003';

  public readonly answeredAtIso = '2026-05-10T10:00:00.000Z';

  public readonly body: AnswerCourseQuestionBodyDto = {
    courseQuestionId: this.courseQuestionId,
    answer: 'Voici la réponse.',
  };

  public readonly teacherUser: AuthUser = {
    id: 'user-teacher-1',
    email: 't@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly teacher: Teacher = {
    id: 'teacher-1',
    name: 'Prof',
    email: this.teacherUser.email,
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null,
    availableChatbots: 0,
    supabaseUserId: this.teacherUser.id,
  };

  public readonly courseQuestion: CourseQuestion = {
    id: this.courseQuestionId,
    courseId: this.courseId,
    studentId: 'student-1',
    questionText: 'Pourquoi ?',
    answer: '',
    createdAt: '2026-01-02T00:00:00.000Z',
    answeredAt: '',
  };

  public readonly course: Course = {
    id: this.courseId,
    sessionId: this.sessionId,
    title: 'Cours',
    description: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly session: Session = {
    id: this.sessionId,
    teacherId: this.teacher.id,
    name: 'S1',
    code: 'ABC123',
    language: 'francais',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly updatedCourseQuestion: CourseQuestion = {
    ...this.courseQuestion,
    answer: this.body.answer,
    answeredAt: this.answeredAtIso,
  };

  public readonly updateCourseQuestionError = new Error(
    'update_course_question failed',
  );

  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly courseQuestionRepository: jest.Mocked<ICourseQuestionRepository>;
  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly useCase: AnswerCourseQuestionUseCase;

  constructor() {
    this.teacherRepository = createMockTeacherRepository();
    this.courseQuestionRepository = createMockCourseQuestionRepository();
    this.courseRepository = createMockCourseRepository();
    this.sessionRepository = createMockSessionRepository();

    this.useCase = new AnswerCourseQuestionUseCase(
      this.teacherRepository,
      this.courseQuestionRepository,
      this.courseRepository,
      this.sessionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.body, this.teacherUser);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenCourseQuestionFound() {
    this.courseQuestionRepository.getCourseQuestionByCourseId.mockResolvedValue(
      this.courseQuestion,
    );
  }

  whenCourseQuestionNotFound() {
    this.courseQuestionRepository.getCourseQuestionByCourseId.mockResolvedValue(
      null,
    );
  }

  whenCourseReturned() {
    this.courseRepository.getCourseById.mockResolvedValue(this.course);
  }

  whenCourseMissing() {
    this.courseRepository.getCourseById.mockResolvedValue(
      null as unknown as Course,
    );
  }

  whenSessionReturned() {
    this.sessionRepository.getSessionById.mockResolvedValue(this.session);
  }

  whenSessionMissing() {
    this.sessionRepository.getSessionById.mockResolvedValue(null);
  }

  whenCourseQuestionsNonEmpty() {
    this.courseQuestionRepository.getCourseQuestionsByCourseId.mockResolvedValue(
      [this.courseQuestion],
    );
  }

  whenCourseQuestionsEmpty() {
    this.courseQuestionRepository.getCourseQuestionsByCourseId.mockResolvedValue(
      [],
    );
  }

  whenUpdateSucceeds() {
    this.courseQuestionRepository.updateCourseQuestion.mockResolvedValue(
      this.updatedCourseQuestion,
    );
  }

  whenUpdateFails() {
    this.courseQuestionRepository.updateCourseQuestion.mockRejectedValue(
      this.updateCourseQuestionError,
    );
  }
}
