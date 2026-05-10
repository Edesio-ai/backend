import { GetStudentCourseQuestionsUseCase } from 'src/application/teaching/course-question/get-student-course-questions.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import { CourseRepository } from 'src/domain/teaching/interfaces/course.repository';
import type { ICourseQuestionRepository } from 'src/domain/teaching/interfaces/i-course-question.repository';
import { StudentRepository } from 'src/domain/teaching/interfaces/student.repository';
import { CourseQuestion } from 'src/domain/teaching/types/course-question.type';
import { Course } from 'src/domain/teaching/types/course.type';
import { createMockCourseQuestionRepository } from 'src/testing/mock-course-question-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';

describe('GetStudentCourseQuestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return student course questions when the student is enrolled', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionMatchesEnrollment();
    fixtures.whenCourseQuestionsReturned();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.courseQuestions);
    expect(fixtures.studentRepository.getStudentByUserId).toHaveBeenCalledWith(
      fixtures.studentUser.id,
    );
    expect(fixtures.courseRepository.getCourseById).toHaveBeenCalledWith(
      fixtures.courseId,
    );
    expect(
      fixtures.studentRepository.getStudentSessionBySessionId,
    ).toHaveBeenCalledWith(fixtures.sessionId);
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionsByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
  });

  it('should throw NotFoundError when student is missing', async () => {
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.courseRepository.getCourseById).not.toHaveBeenCalled();
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionsByCourseId,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when course is missing', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseMissing();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.studentRepository.getStudentSessionBySessionId,
    ).not.toHaveBeenCalled();
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionsByCourseId,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when student session row is missing', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionsByCourseId,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when session belongs to another student', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionOwnedBySomeoneElse();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionsByCourseId,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from course question repository', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionMatchesEnrollment();
    fixtures.whenCourseQuestionsFail();

    await expect(fixtures.whenExecute()).rejects.toBe(
      fixtures.courseQuestionsError,
    );
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly sessionId = 'session-1';

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

  public readonly courseQuestions: CourseQuestion[] = [
    {
      id: 'cq-1',
      courseId: this.courseId,
      studentId: this.enrolledStudent.id,
      questionText: 'Question ?',
      answer: 'Réponse',
      createdAt: '2026-01-01T00:00:00.000Z',
      answeredAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  public readonly courseQuestionsError = new Error('course_questions failed');

  public readonly courseQuestionRepository: jest.Mocked<ICourseQuestionRepository>;
  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: GetStudentCourseQuestionsUseCase;

  constructor() {
    this.courseQuestionRepository = createMockCourseQuestionRepository();
    this.studentRepository = createMockStudentRepository();
    this.courseRepository = createMockCourseRepository();

    this.useCase = new GetStudentCourseQuestionsUseCase(
      this.courseQuestionRepository,
      this.studentRepository,
      this.courseRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.studentUser);
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
    this.studentRepository.getStudentSessionBySessionId.mockResolvedValue({
      sessionId: this.sessionId,
      studentId: this.enrolledStudent.id,
    });
  }

  whenStudentSessionNotFound() {
    this.studentRepository.getStudentSessionBySessionId.mockResolvedValue(null);
  }

  whenStudentSessionOwnedBySomeoneElse() {
    this.studentRepository.getStudentSessionBySessionId.mockResolvedValue({
      sessionId: this.sessionId,
      studentId: 'other-student',
    });
  }

  whenCourseQuestionsReturned() {
    this.courseQuestionRepository.getCourseQuestionsByCourseId.mockResolvedValue(
      this.courseQuestions,
    );
  }

  whenCourseQuestionsFail() {
    this.courseQuestionRepository.getCourseQuestionsByCourseId.mockRejectedValue(
      this.courseQuestionsError,
    );
  }
}
