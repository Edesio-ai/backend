import { DeleteCourseUseCase } from './delete-course.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  NotFoundError,
  UnauthorizedError,
} from 'src/domain/shared/errors/global.errors';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';
import type { IStudentCourseStatsRepository } from 'src/domain/teaching/student-course-stats/contracts/i-student-course-stats.repository';
import { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import { TeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import type { ICourseQuestionRepository } from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockCourseQuestionRepository } from 'src/testing/mock-course-question-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockQuestionsRepository } from 'src/testing/mock-questions-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentCourseStatsRepository } from 'src/testing/mock-student-course-stats-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('DeleteCourseUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.courseRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when course is not found', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionsRepository.deleteCourseQuizQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when course belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(
      fixtures.questionsRepository.deleteCourseQuizQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should delete quiz questions, files, stats, course question rows and course in order', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenDeleteSucceeds();

    await fixtures.whenExecute();

    expect(
      fixtures.questionsRepository.deleteCourseQuizQuestions,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.courseFileRepository.deleteCoursesFilesByCourseIds,
    ).toHaveBeenCalledWith([fixtures.courseId]);
    expect(
      fixtures.studentCourseStatsRepository.deleteStudentCourseStatsByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.courseQuestionRepository.deleteCourseQuestionsByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(fixtures.courseRepository.deleteCourseById).toHaveBeenCalledWith(
      fixtures.courseId,
    );
  });

  it('should call deletions in the correct order', async () => {
    const callOrder: string[] = [];
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();

    (
      fixtures.questionsRepository.deleteCourseQuizQuestions as jest.Mock
    ).mockImplementation(async () => {
      callOrder.push('deleteCourseQuizQuestions');
    });
    (
      fixtures.courseFileRepository.deleteCoursesFilesByCourseIds as jest.Mock
    ).mockImplementation(async () => {
      callOrder.push('deleteCoursesFilesByCourseIds');
    });
    (
      fixtures.studentCourseStatsRepository
        .deleteStudentCourseStatsByCourseId as jest.Mock
    ).mockImplementation(async () => {
      callOrder.push('deleteStudentCourseStatsByCourseId');
    });
    (
      fixtures.courseQuestionRepository
        .deleteCourseQuestionsByCourseId as jest.Mock
    ).mockImplementation(async () => {
      callOrder.push('deleteCourseQuestionsByCourseId');
    });
    (
      fixtures.courseRepository.deleteCourseById as jest.Mock
    ).mockImplementation(async () => {
      callOrder.push('deleteCourseById');
    });

    await fixtures.whenExecute();

    expect(callOrder).toEqual([
      'deleteCourseQuizQuestions',
      'deleteCoursesFilesByCourseIds',
      'deleteStudentCourseStatsByCourseId',
      'deleteCourseQuestionsByCourseId',
      'deleteCourseById',
    ]);
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

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly courseQuestionRepository: jest.Mocked<ICourseQuestionRepository>;
  public readonly questionsRepository: jest.Mocked<IQuestionsRepository>;
  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly studentCourseStatsRepository: jest.Mocked<IStudentCourseStatsRepository>;
  public readonly useCase: DeleteCourseUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();

    this.teacherRepository = createMockTeacherRepository();

    this.courseQuestionRepository = createMockCourseQuestionRepository();

    this.questionsRepository = createMockQuestionsRepository();

    this.studentRepository = createMockStudentRepository();

    this.courseFileRepository = createMockCourseFileRepository();

    this.studentCourseStatsRepository =
      createMockStudentCourseStatsRepository();

    this.useCase = new DeleteCourseUseCase(
      this.courseRepository,
      this.teacherRepository,
      this.courseQuestionRepository,
      this.studentRepository,
      this.courseFileRepository,
      this.questionsRepository,
      this.studentCourseStatsRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.user);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenCourseNotFound() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue(
      null as any,
    );
  }

  whenCourseWithSessionMatchesTeacher() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: this.teacher.id },
      teachers: {},
    });
  }

  whenCourseWithSessionBelongsToOtherTeacher() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher' },
      teachers: {},
    });
  }

  whenDeleteSucceeds() {
    this.questionsRepository.deleteCourseQuizQuestions.mockResolvedValue(
      undefined,
    );
    this.courseFileRepository.deleteCoursesFilesByCourseIds.mockResolvedValue(
      undefined,
    );
    this.studentCourseStatsRepository.deleteStudentCourseStatsByCourseId.mockResolvedValue(
      undefined,
    );
    this.courseQuestionRepository.deleteCourseQuestionsByCourseId.mockResolvedValue(
      undefined,
    );
    this.courseRepository.deleteCourseById.mockResolvedValue(undefined);
  }
}
