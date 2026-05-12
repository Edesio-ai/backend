import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  SendCourseQuestionBody,
  SendCourseQuestionUseCase,
} from 'src/application/teaching/course-question/send-course-question.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { ICourseQuestionRepository } from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import { CourseQuestion } from 'src/domain/teaching/course-question/types/course-question.type';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import { Course } from 'src/domain/teaching/course/types/course.type';
import { createMockCourseQuestionRepository } from 'src/testing/mock-course-question-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';

describe('SendCourseQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create course question when student is enrolled in session', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionMatchesEnrollment();
    fixtures.whenCreateSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.createdCourseQuestion);
    expect(fixtures.studentRepository.getStudentByUserId).toHaveBeenCalledWith(
      fixtures.studentUser.id,
    );
    expect(fixtures.courseRepository.getCourseById).toHaveBeenCalledWith(
      fixtures.body.courseId,
    );
    expect(
      fixtures.studentSessionRepository.getStudentSessionBySessionId,
    ).toHaveBeenCalledWith(fixtures.sessionId);
    expect(
      fixtures.courseQuestionRepository.createCourseQuestion,
    ).toHaveBeenCalledWith({
      courseId: fixtures.body.courseId,
      questionText: fixtures.body.questionText,
      studentId: fixtures.enrolledStudent.id,
    });
  });

  it('should throw NotFoundException when student is missing', async () => {
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(fixtures.courseRepository.getCourseById).not.toHaveBeenCalled();
    expect(
      fixtures.courseQuestionRepository.createCourseQuestion,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when course is missing', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseMissing();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.studentSessionRepository.getStudentSessionBySessionId,
    ).not.toHaveBeenCalled();
    expect(
      fixtures.courseQuestionRepository.createCourseQuestion,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when student session row is missing', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.courseQuestionRepository.createCourseQuestion,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when session belongs to another student', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionOwnedBySomeoneElse();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(
      fixtures.courseQuestionRepository.createCourseQuestion,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from course question repository', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionMatchesEnrollment();
    fixtures.whenCreateFails();

    await expect(fixtures.whenExecute()).rejects.toBe(
      fixtures.createCourseQuestionError,
    );
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly sessionId = 'session-1';

  public readonly body: SendCourseQuestionBody = {
    courseId: this.courseId,
    questionText: 'Pourquoi le ciel est bleu ?',
  };

  public readonly studentUser: AuthUser = {
    id: 'user-student-1',
    email: 's@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'student' },
  };

  public readonly enrolledStudent = {
    id: 'student-1',
    supabaseUserId: this.studentUser.id,
    name: 'Élève',
    email: 's@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly course: Course = {
    id: this.courseId,
    sessionId: this.sessionId,
    title: 'Cours',
    description: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly createdCourseQuestion: CourseQuestion = {
    id: 'cq-new',
    courseId: this.courseId,
    studentId: this.enrolledStudent.id,
    questionText: this.body.questionText,
    answer: '',
    createdAt: '2026-01-03T00:00:00.000Z',
    answeredAt: '',
  };

  public readonly createCourseQuestionError = new Error(
    'create_course_question failed',
  );

  public readonly courseQuestionRepository: jest.Mocked<ICourseQuestionRepository>;
  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly studentSessionRepository: ReturnType<
    typeof createMockStudentSessionRepository
  >;
  public readonly useCase: SendCourseQuestionUseCase;

  constructor() {
    this.courseQuestionRepository = createMockCourseQuestionRepository();
    this.studentRepository = createMockStudentRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.courseRepository = createMockCourseRepository();

    this.useCase = new SendCourseQuestionUseCase(
      this.courseQuestionRepository,
      this.studentRepository,
      this.studentSessionRepository,
      this.courseRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.body, this.studentUser);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(
      this.enrolledStudent,
    );
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenCourseReturned() {
    this.courseRepository.getCourseById.mockResolvedValue(this.course);
  }

  whenCourseMissing() {
    this.courseRepository.getCourseById.mockResolvedValue(
      null as unknown as Course,
    );
  }

  whenStudentSessionMatchesEnrollment() {
    this.studentSessionRepository.getStudentSessionBySessionId.mockResolvedValue(
      {
        sessionId: this.sessionId,
        studentId: this.enrolledStudent.id,
      },
    );
  }

  whenStudentSessionNotFound() {
    this.studentSessionRepository.getStudentSessionBySessionId.mockResolvedValue(
      null,
    );
  }

  whenStudentSessionOwnedBySomeoneElse() {
    this.studentSessionRepository.getStudentSessionBySessionId.mockResolvedValue(
      {
        sessionId: this.sessionId,
        studentId: 'other-student',
      },
    );
  }

  whenCreateSucceeds() {
    this.courseQuestionRepository.createCourseQuestion.mockResolvedValue(
      this.createdCourseQuestion,
    );
  }

  whenCreateFails() {
    this.courseQuestionRepository.createCourseQuestion.mockRejectedValue(
      this.createCourseQuestionError,
    );
  }
}
