import { GetStudentCourseQuestionsUseCase } from 'src/application/teaching/course-question/get-student-course-questions.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import type { ICourseQuestionRepository } from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { CourseQuestion } from 'src/domain/teaching/course-question/types/course-question.type';
import { Course } from 'src/domain/teaching/course/types/course.type';
import { createMockCourseQuestionRepository } from 'src/testing/mock-course-question-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

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
    expect(fixtures.studentRepository.getStudentByUserId).toHaveBeenCalledWith(fixtures.studentUser.id);
    expect(fixtures.courseRepository.getCourseById).toHaveBeenCalledWith(fixtures.courseId);
    expect(fixtures.studentSessionRepository.getStudentSession).toHaveBeenCalledWith(
      fixtures.sessionId,
      fixtures.enrolledStudent.id,
    );
    expect(fixtures.courseQuestionRepository.getCourseQuestionsByCourseId).toHaveBeenCalledWith(fixtures.courseId);
  });

  it('should throw NotFoundError when student is missing', async () => {
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.courseRepository.getCourseById).not.toHaveBeenCalled();
    expect(fixtures.courseQuestionRepository.getCourseQuestionsByCourseId).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when course is missing', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseMissing();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.studentSessionRepository.getStudentSession).not.toHaveBeenCalled();
    expect(fixtures.courseQuestionRepository.getCourseQuestionsByCourseId).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when course questions are not published', async () => {
    fixtures.whenStudentFound();
    fixtures.whenUnpublishedCourseReturned();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.studentSessionRepository.getStudentSession).not.toHaveBeenCalled();
    expect(fixtures.courseQuestionRepository.getCourseQuestionsByCourseId).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when student is not enrolled in session', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.courseQuestionRepository.getCourseQuestionsByCourseId).not.toHaveBeenCalled();
  });

  it('should propagate errors from course question repository', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseReturned();
    fixtures.whenStudentSessionMatchesEnrollment();
    fixtures.whenCourseQuestionsFail();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.courseQuestionsError);
  });

  it('should return course questions for admin without enrollment checks', async () => {
    fixtures.whenCourseQuestionsReturned();

    const result = await fixtures.whenExecuteAsAdmin();

    expect(result).toEqual(fixtures.courseQuestions);
    expect(fixtures.studentRepository.getStudentByUserId).not.toHaveBeenCalled();
    expect(fixtures.courseRepository.getCourseById).not.toHaveBeenCalled();
    expect(fixtures.courseQuestionRepository.getCourseQuestionsByCourseId).toHaveBeenCalledWith(fixtures.courseId);
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
  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly studentSessionRepository: ReturnType<typeof createMockStudentSessionRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly useCase: GetStudentCourseQuestionsUseCase;

  constructor() {
    this.courseQuestionRepository = createMockCourseQuestionRepository();
    this.studentRepository = createMockStudentRepository();
    this.courseRepository = createMockCourseRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.sessionRepository = createMockSessionRepository();

    this.useCase = new GetStudentCourseQuestionsUseCase(
      this.courseQuestionRepository,
      this.studentRepository,
      this.courseRepository,
      this.studentSessionRepository,
      this.teacherRepository,
      this.sessionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.studentUser);
  }

  whenExecuteAsAdmin() {
    const adminUser: AuthUser = {
      ...this.studentUser,
      id: 'user-admin-1',
      metadata: { role: 'admin' },
    };
    return this.useCase.execute(this.courseId, adminUser);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.enrolledStudent);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenCourseReturned() {
    this.courseRepository.getCourseById.mockResolvedValue(this.course);
  }

  whenUnpublishedCourseReturned() {
    this.courseRepository.getCourseById.mockResolvedValue({
      ...this.course,
      validatedQuestions: false,
    });
  }

  whenCourseMissing() {
    this.courseRepository.getCourseById.mockResolvedValue(null as unknown as Course);
  }

  whenStudentSessionMatchesEnrollment() {
    this.studentSessionRepository.getStudentSession.mockResolvedValue({
      sessionId: this.sessionId,
      studentId: this.enrolledStudent.id,
    });
  }

  whenStudentSessionNotFound() {
    this.studentSessionRepository.getStudentSession.mockResolvedValue(null);
  }

  whenCourseQuestionsReturned() {
    this.courseQuestionRepository.getCourseQuestionsByCourseId.mockResolvedValue(this.courseQuestions);
  }

  whenCourseQuestionsFail() {
    this.courseQuestionRepository.getCourseQuestionsByCourseId.mockRejectedValue(this.courseQuestionsError);
  }
}
