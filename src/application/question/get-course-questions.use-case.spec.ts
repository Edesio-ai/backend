import { GetCourseQuestionsUseCase } from './get-course-questions.use-case';
import { AuthUser } from '../../domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from '../../domain/shared/global/errors/global.errors';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { QuestionsRepository } from '../../domain/teaching/interface/questions.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { StudentRepository } from 'src/domain/teaching/interface/student.repository';
import {
  Course,
  CourseWithSession,
} from '../../domain/teaching/types/course.type';
import { Question } from '../../domain/teaching/types/question.type';

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
      expect(
        fixtures.coursesRepository.getCourseWithSessionById,
      ).toHaveBeenCalledWith(fixtures.courseId, TEACHER_COURSE_SELECT);
      expect(
        fixtures.studentRepository.getStudentByUserId,
      ).not.toHaveBeenCalled();
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).toHaveBeenCalledWith(fixtures.courseId);
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when teacher is missing', async () => {
      fixtures.whenTeacherNotFound();

      const promise = fixtures.whenTeacherExecute();

      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(
        fixtures.coursesRepository.getCourseWithSessionById,
      ).not.toHaveBeenCalled();
      expect(
        fixtures.studentRepository.getStudentByUserId,
      ).not.toHaveBeenCalled();
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when course is missing', async () => {
      fixtures.whenTeacherFound();
      fixtures.whenCourseNotFound();

      const promise = fixtures.whenTeacherExecute();

      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(
        fixtures.coursesRepository.getCourseWithSessionById,
      ).toHaveBeenCalledWith(fixtures.courseId, TEACHER_COURSE_SELECT);
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when session teacher does not match', async () => {
      fixtures.whenTeacherFound();
      fixtures.whenCourseSessionBelongsToAnotherTeacher();

      const promise = fixtures.whenTeacherExecute();

      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).not.toHaveBeenCalled();
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
      expect(
        fixtures.teachersRepository.getTeacherByUserId,
      ).not.toHaveBeenCalled();
      expect(
        fixtures.coursesRepository.getCourseWithSessionById,
      ).not.toHaveBeenCalled();
      expect(
        fixtures.studentRepository.getStudentByUserId,
      ).toHaveBeenCalledWith(fixtures.studentUser.id);
      expect(fixtures.coursesRepository.getCourseById).toHaveBeenCalledWith(
        fixtures.courseId,
      );
      expect(
        fixtures.studentRepository.getStudentSessionBySessionId,
      ).toHaveBeenCalledWith(fixtures.sessionId);
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).toHaveBeenCalledWith(fixtures.courseId);
    });

    it('should throw NotFoundError when student is missing', async () => {
      fixtures.whenStudentNotFound();

      await expect(fixtures.whenStudentExecute()).rejects.toBeInstanceOf(
        NotFoundError,
      );
      expect(fixtures.coursesRepository.getCourseById).not.toHaveBeenCalled();
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when course is missing', async () => {
      fixtures.whenStudentFound();
      fixtures.whenCourseByIdMissing();

      await expect(fixtures.whenStudentExecute()).rejects.toBeInstanceOf(
        NotFoundError,
      );
      expect(
        fixtures.studentRepository.getStudentSessionBySessionId,
      ).not.toHaveBeenCalled();
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when student is not enrolled in session', async () => {
      fixtures.whenStudentFound();
      fixtures.whenCourseReturnedForStudent();
      fixtures.whenStudentSessionNotFound();

      await expect(fixtures.whenStudentExecute()).rejects.toBeInstanceOf(
        ForbiddenError,
      );
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when session row belongs to another student', async () => {
      fixtures.whenStudentFound();
      fixtures.whenCourseReturnedForStudent();
      fixtures.whenStudentSessionOwnedBySomeoneElse();

      await expect(fixtures.whenStudentExecute()).rejects.toBeInstanceOf(
        ForbiddenError,
      );
      expect(
        fixtures.questionsRepository.getCourseQuestions,
      ).not.toHaveBeenCalled();
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

  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly teachersRepository: jest.Mocked<TeacherRepository>;
  public readonly coursesRepository: jest.Mocked<CourseRepository>;
  public readonly studentRepository: jest.Mocked<StudentRepository>;
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
      getFileBufferFromStorage: jest.fn(),
      deleteCourseById: jest.fn(),
      updateCourse: jest.fn(),
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
    this.studentRepository = {
      getStudentsByIds: jest.fn(),
      createStudentSession: jest.fn(),
      getStudentJoinedSessions: jest.fn(),
      getStudentByUserId: jest.fn(),
      getStudentsSessionsByIds: jest.fn(),
      getStudentSessionsBySessionId: jest.fn(),
      deleteStudentSessionsBySessionId: jest.fn(),
      getStudentStatsByCourseId: jest.fn(),
      deleteStudentCourseStatsByCourseId: jest.fn(),
      createStudent: jest.fn(),
      storeStudentPhoto: jest.fn(),
      updateStudentPhoto: jest.fn(),
      getStudentSessionBySessionId: jest.fn(),
      deleteStudentSession: jest.fn(),
    };

    this.useCase = new GetCourseQuestionsUseCase(
      this.questionsRepository,
      this.teachersRepository,
      this.coursesRepository,
      this.studentRepository,
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
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(
      this.enrolledStudent,
    );
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null as any);
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
      teachers: {},
    });
  }

  whenCourseReturnedForStudent() {
    this.coursesRepository.getCourseById.mockResolvedValue(
      this.courseForStudent,
    );
  }

  whenCourseByIdMissing() {
    this.coursesRepository.getCourseById.mockResolvedValue(null as any);
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
