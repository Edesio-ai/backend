import { GetCourseDetailsUseCase } from './get-course-details.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { NotFoundError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { Course, CourseDetails } from 'src/domain/teaching/course/types/course.type';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { CourseFile } from 'src/domain/teaching/course-file/types/course-file.type';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';
import { Question } from 'src/domain/teaching/question/types/question.type';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import type { IStudentCourseStatsRepository } from 'src/domain/teaching/student-course-stats/contracts/i-student-course-stats.repository';
import { StudentCourseStatsWithStudent } from 'src/domain/teaching/student-course-stats/types/student-course-stats.type';
import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockQuestionsRepository } from 'src/testing/mock-questions-repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockStudentCourseStatsRepository } from 'src/testing/mock-student-course-stats-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('GetCourseDetailsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when course is not found', async () => {
    fixtures.whenCourseNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.teacherRepository.getTeacherByUserId).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.sessionRepository.getSessionById).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when session belongs to another teacher', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fixtures.questionsRepository.getCourseQuestions).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when session is not found', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('should return course details with students count, average success rate, files and questions', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenDetailsDataReturned();

    const result = await fixtures.whenExecute();

    fixtures.thenDetailsLookupsCalled();
    fixtures.thenReturnsExpectedDetails(result);
  });

  it('should return averageSuccessRate null when no enrolled student has attempts', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenDetailsDataReturned({ courseStats: [] });

    const result = await fixtures.whenExecute();

    expect(result.averageSuccessRate).toBeNull();
    expect(result.studentsCount).toBe(2);
    expect(result.studentsWhoUsedChatbotCount).toBe(0);
  });

  it('should ignore non-enrolled stats for chatbot count and averageSuccessRate', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenDetailsDataReturned({
      courseStats: [
        {
          studentId: 'student-1',
          attemptedQuestions: 3,
          correctAnswers: 1,
          lastAttemptAt: '2026-01-01T00:00:00.000Z',
          student: { id: 'student-1', name: 'Alice', email: 'a@school.com', photoUrl: '' },
        },
        {
          studentId: 'student-2',
          attemptedQuestions: 0,
          correctAnswers: 0,
          lastAttemptAt: '2026-01-02T00:00:00.000Z',
          student: { id: 'student-2', name: 'Bob', email: 'b@school.com', photoUrl: '' },
        },
        {
          studentId: 'outsider',
          attemptedQuestions: 5,
          correctAnswers: 5,
          lastAttemptAt: '2026-01-03T00:00:00.000Z',
          student: { id: 'outsider', name: 'Zoe', email: 'z@school.com', photoUrl: '' },
        },
      ],
    });

    const result = await fixtures.whenExecute();

    expect(result.studentsWhoUsedChatbotCount).toBe(1);
    // Only enrolled student-1 (33%) — outsider 100% must not inflate the average.
    expect(result.averageSuccessRate).toBe(33);
  });

  it('should return null average when only non-enrolled students have attempts', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenDetailsDataReturned({
      courseStats: [
        {
          studentId: 'outsider',
          attemptedQuestions: 5,
          correctAnswers: 5,
          lastAttemptAt: '2026-01-03T00:00:00.000Z',
          student: { id: 'outsider', name: 'Zoe', email: 'z@school.com', photoUrl: '' },
        },
      ],
    });

    const result = await fixtures.whenExecute();

    expect(result.studentsWhoUsedChatbotCount).toBe(0);
    expect(result.averageSuccessRate).toBeNull();
  });

  it('should map null question proposals to empty arrays and keep full question fields', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenDetailsDataReturned();
    fixtures.questionsRepository.getCourseQuestions.mockResolvedValue([
      {
        ...fixtures.questions[0],
        proposals: null,
        correctAnswers: null,
        explanation: 'Parce que',
      },
    ]);

    const result = await fixtures.whenExecute();

    expect(result.questions).toEqual([
      {
        id: 'q-1',
        courseId: fixtures.courseId,
        questionText: 'Question ?',
        type: 'single',
        proposals: [],
        correctAnswers: null,
        explanation: 'Parce que',
        createdAt: '2026-01-01T00:00:00.000Z',
        positionOrder: 1,
        cheatingDetectionEnabled: false,
      },
    ]);
  });

  it('should average success rates across students who attempted questions', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenDetailsDataReturned({
      courseStats: [
        {
          studentId: 'student-1',
          attemptedQuestions: 4,
          correctAnswers: 2,
          lastAttemptAt: '2026-01-01T00:00:00.000Z',
          student: {
            id: 'student-1',
            name: 'Alice',
            email: 'a@school.com',
            photoUrl: '',
          },
        },
        {
          studentId: 'student-2',
          attemptedQuestions: 2,
          correctAnswers: 2,
          lastAttemptAt: '2026-01-02T00:00:00.000Z',
          student: {
            id: 'student-2',
            name: 'Bob',
            email: 'b@school.com',
            photoUrl: '',
          },
        },
        {
          studentId: 'student-3',
          attemptedQuestions: 0,
          correctAnswers: 0,
          lastAttemptAt: '2026-01-03T00:00:00.000Z',
          student: {
            id: 'student-3',
            name: 'Carla',
            email: 'c@school.com',
            photoUrl: '',
          },
        },
      ],
    });

    const result = await fixtures.whenExecute();

    // (50% + 100%) / 2 = 75 — student-3 has 0 attempts so ignored for rate
    expect(result.averageSuccessRate).toBe(75);
    expect(result.studentsWhoUsedChatbotCount).toBe(2);
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly sessionId = 'session-1';

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

  public readonly course: Course = {
    id: this.courseId,
    sessionId: this.sessionId,
    title: 'Introduction',
    description: 'Desc',
    contentText: 'Contenu',
    validatedQuestions: true,
    positionOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly session = {
    id: this.sessionId,
    teacherId: this.teacher.id,
    name: 'Session',
    code: 'ABCD',
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
    studentCount: 0,
    pendingQuestionCount: 0,
  };

  public readonly questions: Question[] = [
    {
      id: 'q-1',
      courseId: this.courseId,
      type: 'single',
      questionText: 'Question ?',
      proposals: ['A', 'B'],
      correctAnswers: ['A'],
      explanation: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      positionOrder: 1,
      cheatingDetectionEnabled: false,
    },
  ];

  public readonly files: CourseFile[] = [
    {
      id: 'f-1',
      courseId: this.courseId,
      fileUrl: 'https://x/f.pdf',
      fileName: 'f.pdf',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  public readonly enrollments = [
    { sessionId: this.sessionId, studentId: 'student-1' },
    { sessionId: this.sessionId, studentId: 'student-2' },
  ];

  public readonly defaultCourseStats: StudentCourseStatsWithStudent[] = [
    {
      studentId: 'student-1',
      attemptedQuestions: 2,
      correctAnswers: 1,
      lastAttemptAt: '2026-01-01T00:00:00.000Z',
      student: {
        id: 'student-1',
        name: 'Alice',
        email: 'a@school.com',
        photoUrl: '',
      },
    },
  ];

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly questionsRepository: jest.Mocked<IQuestionsRepository>;
  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly studentCourseStatsRepository: jest.Mocked<IStudentCourseStatsRepository>;
  public readonly studentSessionRepository: jest.Mocked<IStudentSessionRepository>;
  public readonly useCase: GetCourseDetailsUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.sessionRepository = createMockSessionRepository();
    this.questionsRepository = createMockQuestionsRepository();
    this.courseFileRepository = createMockCourseFileRepository();
    this.studentCourseStatsRepository = createMockStudentCourseStatsRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.useCase = new GetCourseDetailsUseCase(
      this.courseRepository,
      this.teacherRepository,
      this.sessionRepository,
      this.questionsRepository,
      this.courseFileRepository,
      this.studentCourseStatsRepository,
      this.studentSessionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.user);
  }

  whenCourseFound() {
    this.courseRepository.getCourseById.mockResolvedValue(this.course);
  }

  whenCourseNotFound() {
    this.courseRepository.getCourseById.mockResolvedValue(null);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenSessionFound() {
    this.sessionRepository.getSessionById.mockResolvedValue(this.session);
  }

  whenSessionNotFound() {
    this.sessionRepository.getSessionById.mockResolvedValue(null);
  }

  whenSessionBelongsToOtherTeacher() {
    this.sessionRepository.getSessionById.mockResolvedValue({
      ...this.session,
      teacherId: 'other-teacher',
    });
  }

  whenDetailsDataReturned(overrides?: {
    courseStats?: StudentCourseStatsWithStudent[];
    enrollments?: { sessionId: string; studentId: string }[];
  }) {
    this.questionsRepository.getCourseQuestions.mockResolvedValue(this.questions);
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue(this.files);
    this.studentCourseStatsRepository.getStudentCourseStatsByCourseId.mockResolvedValue(
      overrides?.courseStats ?? this.defaultCourseStats,
    );
    this.studentSessionRepository.getStudentsSessionsByIds.mockResolvedValue(
      overrides?.enrollments ?? this.enrollments,
    );
  }

  thenDetailsLookupsCalled() {
    expect(this.courseRepository.getCourseById).toHaveBeenCalledWith(this.courseId);
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(this.user.id);
    expect(this.sessionRepository.getSessionById).toHaveBeenCalledWith(this.sessionId);
    expect(this.questionsRepository.getCourseQuestions).toHaveBeenCalledWith(this.courseId);
    expect(this.courseFileRepository.getCourseFilesByCourseId).toHaveBeenCalledWith(this.courseId);
    expect(this.studentCourseStatsRepository.getStudentCourseStatsByCourseId).toHaveBeenCalledWith(this.courseId);
    expect(this.studentSessionRepository.getStudentsSessionsByIds).toHaveBeenCalledWith([this.sessionId]);
  }

  thenReturnsExpectedDetails(result: CourseDetails) {
    expect(result).toEqual({
      course: {
        ...this.course,
        contentText: this.course.contentText ?? null,
        createdAt: this.course.createdAt ?? '',
      },
      studentsCount: 2,
      studentsWhoUsedChatbotCount: 1,
      averageSuccessRate: 50,
      files: this.files,
      questions: [
        {
          id: 'q-1',
          courseId: this.courseId,
          questionText: 'Question ?',
          type: 'single',
          proposals: ['A', 'B'],
          correctAnswers: ['A'],
          explanation: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          positionOrder: 1,
          cheatingDetectionEnabled: false,
        },
      ],
    });
  }
}
