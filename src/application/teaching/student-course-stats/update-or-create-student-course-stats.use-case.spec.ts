import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateOrCreateStudentCourseStatsUseCase } from 'src/application/teaching/student-course-stats/update-or-create-student-course-stats.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import type { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import type { IStudentCourseStatsRepository } from 'src/domain/teaching/student-course-stats/contracts/i-student-course-stats.repository';
import { Course } from 'src/domain/teaching/course/types/course.type';
import { Student } from 'src/domain/teaching/student/type/student.type';
import type { UpdateOrCreateStudentCourseStatsBodyDto } from 'src/presentation/teaching/student-course-stats/dtos/update-or-create-student-course-stats.dto';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentCourseStatsRepository } from 'src/testing/mock-student-course-stats-repository';

describe('UpdateOrCreateStudentCourseStatsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundException when student is missing', async () => {
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundException);
    expect(fixtures.courseRepository.getCourseById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when course is missing', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundException);
    expect(fixtures.studentCourseStatsRepository.getStudentCourseStatsByStudentIdAndCourseId).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when course is not published', async () => {
    fixtures.whenStudentFound();
    fixtures.whenUnpublishedCourseFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenException);
    expect(fixtures.studentCourseStatsRepository.getStudentCourseStatsByStudentIdAndCourseId).not.toHaveBeenCalled();
  });

  it('should update existing stats when a row exists', async () => {
    fixtures.whenStudentFound();
    fixtures.whenCourseFound();
    fixtures.whenExistingStatsReturned();

    await fixtures.whenExecute();

    expect(fixtures.studentCourseStatsRepository.updateStudentCourseStats).toHaveBeenCalledWith(
      'stat-1',
      fixtures.body,
    );
    expect(fixtures.studentCourseStatsRepository.createStudentCourseStats).not.toHaveBeenCalled();
  });

  it('should create stats when none exist', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-05T10:00:00.000Z'));
    fixtures.whenStudentFound();
    fixtures.whenCourseFound();
    fixtures.whenNoExistingStats();

    await fixtures.whenExecute();

    expect(fixtures.studentCourseStatsRepository.createStudentCourseStats).toHaveBeenCalledWith({
      studentId: fixtures.student.id,
      courseId: fixtures.courseId,
      attemptedQuestions: fixtures.body.attemptedQuestions,
      correctAnswers: fixtures.body.correctAnswers,
      lastAttemptAt: '2026-05-05T10:00:00.000Z',
    });
    expect(fixtures.studentCourseStatsRepository.updateStudentCourseStats).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});

class Fixtures {
  public readonly user: AuthUser = {
    id: 'user-1',
    email: 's@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'student' },
  };

  public readonly student: Student = {
    id: 'student-1',
    supabaseUserId: this.user.id,
    name: 'Sam',
    email: 's@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly courseId = 'course-1';
  public readonly course: Course = {
    id: this.courseId,
    sessionId: 'session-1',
    title: 'Cours',
    description: null,
    contentText: null,
  };

  public readonly body: UpdateOrCreateStudentCourseStatsBodyDto = {
    attemptedQuestions: 12,
    correctAnswers: 9,
  };

  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly studentCourseStatsRepository: jest.Mocked<IStudentCourseStatsRepository>;
  public readonly useCase: UpdateOrCreateStudentCourseStatsUseCase;

  constructor() {
    this.studentRepository = createMockStudentRepository();
    this.courseRepository = createMockCourseRepository();
    this.studentCourseStatsRepository = createMockStudentCourseStatsRepository();
    this.useCase = new UpdateOrCreateStudentCourseStatsUseCase(
      this.studentRepository,
      this.courseRepository,
      this.studentCourseStatsRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.user, this.body);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.student);
  }

  whenCourseNotFound() {
    this.courseRepository.getCourseById.mockResolvedValue(null);
  }

  whenCourseFound() {
    this.courseRepository.getCourseById.mockResolvedValue(this.course);
  }

  whenUnpublishedCourseFound() {
    this.courseRepository.getCourseById.mockResolvedValue({
      ...this.course,
      validatedQuestions: false,
    });
  }

  whenExistingStatsReturned() {
    this.studentCourseStatsRepository.getStudentCourseStatsByStudentIdAndCourseId.mockResolvedValue({
      id: 'stat-1',
      studentId: this.student.id,
      courseId: this.courseId,
      attemptedQuestions: 1,
      correctAnswers: 1,
      lastAttemptAt: '2026-01-02T00:00:00.000Z',
    });
    this.studentCourseStatsRepository.updateStudentCourseStats.mockResolvedValue();
  }

  whenNoExistingStats() {
    this.studentCourseStatsRepository.getStudentCourseStatsByStudentIdAndCourseId.mockResolvedValue(null);
    this.studentCourseStatsRepository.createStudentCourseStats.mockResolvedValue();
  }
}
