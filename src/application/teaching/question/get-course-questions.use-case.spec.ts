import { GetCourseQuestionsUseCase } from './get-course-questions.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockQuestionsRepository } from 'src/testing/mock-questions-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';
import { Course, CourseWithSession } from 'src/domain/teaching/course/types/course.type';
import { Question } from 'src/domain/teaching/question/types/question.type';

/** Même valeur que dans `GetCourseQuestionsUseCase.checkTeacherAccess` (PostgREST select). */
const TEACHER_COURSE_SELECT = `
      id,
      sessions:sessions!inner (
        teacher_id,
        language
      )`;

describe('GetCourseQuestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('teacher', () => {
    it('should return course questions when teacher owns the course session', async () => {
      fixtures.whenTeacherFound();
      fixtures.whenCourseWithSessionMatchesTeacher();
      fixtures.whenQuestionsReturned();

      const result = await fixtures.whenTeacherExecute();

      expect(result).toEqual(fixtures.questions);
      expect(fixtures.coursesRepository.getCourseWithSessionById).toHaveBeenCalledWith(
        fixtures.courseId,
        TEACHER_COURSE_SELECT,
      );
      expect(fixtures.studentRepository.getStudentByUserId).not.toHaveBeenCalled();
      expect(fixtures.questionsRepository.getCourseQuestions).toHaveBeenCalledWith(fixtures.courseId);
      expect(fixtures.questionsRepository.getCourseQuestions).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when teacher is missing', async () => {
      fixtures.whenTeacherNotFound();

      const promise = fixtures.whenTeacherExecute();

      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(fixtures.coursesRepository.getCourseWithSessionById).not.toHaveBeenCalled();
      expect(fixtures.studentRepository.getStudentByUserId).not.toHaveBeenCalled();
      expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when course is missing', async () => {
      fixtures.whenTeacherFound();
      fixtures.whenCourseNotFound();

      const promise = fixtures.whenTeacherExecute();

      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(fixtures.coursesRepository.getCourseWithSessionById).toHaveBeenCalledWith(
        fixtures.courseId,
        TEACHER_COURSE_SELECT,
      );
      expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when session teacher does not match', async () => {
      fixtures.whenTeacherFound();
      fixtures.whenCourseSessionBelongsToAnotherTeacher();

      const promise = fixtures.whenTeacherExecute();

      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
    });

    it('should propagate errors from questions repository', async () => {
      fixtures.whenTeacherFound();
      fixtures.whenCourseWithSessionMatchesTeacher();
      fixtures.whenQuestionsFail();

      const promise = fixtures.whenTeacherExecute();

      await expect(promise).rejects.toBe(fixtures.questionsError);
    });
  });

  describe('student', () => {
    it('should return questions when student is enrolled in the course session', async () => {
      fixtures.whenStudentFound();
      fixtures.whenCourseReturnedForStudent();
      fixtures.whenStudentSessionMatchesEnrollment();
      fixtures.whenQuestionsReturned();

      const result = await fixtures.whenStudentExecute();

      expect(result).toEqual(fixtures.questions);
      expect(fixtures.teachersRepository.getTeacherByUserId).not.toHaveBeenCalled();
      expect(fixtures.coursesRepository.getCourseWithSessionById).not.toHaveBeenCalled();
      expect(fixtures.studentRepository.getStudentByUserId).toHaveBeenCalledWith(fixtures.studentUser.id);
      expect(fixtures.coursesRepository.getCourseById).toHaveBeenCalledWith(fixtures.courseId);
      expect(fixtures.studentSessionRepository.getStudentSessionBySessionId).toHaveBeenCalledWith(fixtures.sessionId);
      expect(fixtures.questionsRepository.getCourseQuestions).toHaveBeenCalledWith(fixtures.courseId);
    });

    it('should throw NotFoundError when student is missing', async () => {
      fixtures.whenStudentNotFound();

      await expect(fixtures.whenStudentExecute()).rejects.toBeInstanceOf(NotFoundError);
      expect(fixtures.coursesRepository.getCourseById).not.toHaveBeenCalled();
      expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when course is missing', async () => {
      fixtures.whenStudentFound();
      fixtures.whenCourseByIdMissing();

      await expect(fixtures.whenStudentExecute()).rejects.toBeInstanceOf(NotFoundError);
      expect(fixtures.studentSessionRepository.getStudentSessionBySessionId).not.toHaveBeenCalled();
      expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when student is not enrolled in session', async () => {
      fixtures.whenStudentFound();
      fixtures.whenCourseReturnedForStudent();
      fixtures.whenStudentSessionNotFound();

      await expect(fixtures.whenStudentExecute()).rejects.toBeInstanceOf(ForbiddenError);
      expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when session row belongs to another student', async () => {
      fixtures.whenStudentFound();
      fixtures.whenCourseReturnedForStudent();
      fixtures.whenStudentSessionOwnedBySomeoneElse();

      await expect(fixtures.whenStudentExecute()).rejects.toBeInstanceOf(ForbiddenError);
      expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
    });
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly sessionId = 'session-1';

  public readonly teacherUser: AuthUser = {
    id: 'user-1',
    email: 't@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly studentUser: AuthUser = {
    id: 'user-student-1',
    email: 's@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'student' },
  };

  public readonly teacher = {
    id: 'teacher-1',
    name: 'Prof',
    email: 't@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null as string | null,
    availableChatbots: 0,
    supabaseUserId: this.teacherUser.id,
  };

  public readonly enrolledStudent = {
    id: 'student-1',
    supabaseUserId: this.studentUser.id,
    name: 'Élève',
    email: 's@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly courseForStudent: Course = {
    id: this.courseId,
    sessionId: this.sessionId,
    title: 'Cours',
    description: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly courseWithSession: CourseWithSession = {
    id: this.courseId,
    session: { teacherId: this.teacher.id },
    teachers: {},
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

  public readonly questionsRepository: jest.Mocked<IQuestionsRepository>;
  public readonly teachersRepository: jest.Mocked<ITeacherRepository>;
  public readonly coursesRepository: jest.Mocked<ICourseRepository>;
  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly studentSessionRepository: jest.Mocked<IStudentSessionRepository>;
  public readonly useCase: GetCourseQuestionsUseCase;

  constructor() {
    this.questionsRepository = createMockQuestionsRepository();
    this.teachersRepository = createMockTeacherRepository();
    this.coursesRepository = createMockCourseRepository();
    this.studentRepository = createMockStudentRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();

    this.useCase = new GetCourseQuestionsUseCase(
      this.questionsRepository,
      this.teachersRepository,
      this.coursesRepository,
      this.studentRepository,
      this.studentSessionRepository,
    );
  }

  whenTeacherExecute() {
    return this.useCase.execute(this.courseId, this.teacherUser);
  }

  whenStudentExecute() {
    return this.useCase.execute(this.courseId, this.studentUser);
  }

  whenTeacherFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.enrolledStudent);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenCourseWithSessionMatchesTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue(this.courseWithSession);
  }

  whenCourseNotFound() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue(null);
  }

  whenCourseSessionBelongsToAnotherTeacher() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher' },
      teachers: {},
    });
  }

  whenCourseReturnedForStudent() {
    this.coursesRepository.getCourseById.mockResolvedValue(this.courseForStudent);
  }

  whenCourseByIdMissing() {
    this.coursesRepository.getCourseById.mockResolvedValue(null);
  }

  whenStudentSessionMatchesEnrollment() {
    this.studentSessionRepository.getStudentSessionBySessionId.mockResolvedValue({
      sessionId: this.sessionId,
      studentId: this.enrolledStudent.id,
    });
  }

  whenStudentSessionNotFound() {
    this.studentSessionRepository.getStudentSessionBySessionId.mockResolvedValue(null);
  }

  whenStudentSessionOwnedBySomeoneElse() {
    this.studentSessionRepository.getStudentSessionBySessionId.mockResolvedValue({
      sessionId: this.sessionId,
      studentId: 'other-student',
    });
  }

  whenQuestionsReturned() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue(this.questions);
  }

  whenQuestionsFail() {
    this.questionsRepository.getCourseQuestions.mockRejectedValue(this.questionsError);
  }
}
