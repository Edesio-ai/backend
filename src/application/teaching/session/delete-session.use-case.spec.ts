import { DeleteSessionUseCase } from './delete-session.use-case';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { IQuestionsRepository } from 'src/domain/teaching/question/contracts/i-questions.repository';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockQuestionsRepository } from 'src/testing/mock-questions-repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('DeleteSessionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete questions, course files, courses, student sessions, then session when courses exist', async () => {
    fixtures.whenSessionHasCourses();

    await fixtures.whenExecute();

    fixtures.thenCascadeDeleteCalledInOrder();
  });

  it('should skip questions and course files when session has no courses', async () => {
    fixtures.whenSessionHasNoCourses();

    await fixtures.whenExecute();

    fixtures.thenQuestionsAndFilesNotCalled();
    fixtures.thenCoursesAndLinksAndSessionDeleted();
  });

  it('should propagate repository errors', async () => {
    fixtures.whenGetCoursesFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly userId = 'user-1';
  public readonly teacherId = 'teacher-1';
  public readonly courses = [{ id: 'course-1' }, { id: 'course-2' }];
  public readonly teacher = {
    id: this.teacherId,
    name: 'T',
    email: 't@example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: 'est-1',
    availableChatbots: 1,
  };

  public readonly repositoryError = new Error('db failed');

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly questionsRepository: jest.Mocked<IQuestionsRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly studentSessionRepository: jest.Mocked<IStudentSessionRepository>;
  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly useCase: DeleteSessionUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.questionsRepository = createMockQuestionsRepository();
    this.sessionRepository = createMockSessionRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.courseFileRepository = createMockCourseFileRepository();
    this.useCase = new DeleteSessionUseCase(
      this.courseRepository,
      this.questionsRepository,
      this.sessionRepository,
      this.teacherRepository,
      this.courseFileRepository,
      this.studentSessionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.sessionId, this.userId);
  }

  whenSessionHasCourses() {
    this.courseRepository.getCoursesBySessionId.mockResolvedValue(
      this.courses as any,
    );
    this.questionsRepository.deleteQuestionsByCourseIds.mockResolvedValue();
    this.courseFileRepository.deleteCoursesFilesByCourseIds.mockResolvedValue();
    this.courseRepository.deleteCoursesBySessionId.mockResolvedValue();
    this.studentSessionRepository.deleteStudentSessionsBySessionId.mockResolvedValue();
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
    this.sessionRepository.deleteSessionByTeacherId.mockResolvedValue();
  }

  whenSessionHasNoCourses() {
    this.courseRepository.getCoursesBySessionId.mockResolvedValue([]);
    this.courseRepository.deleteCoursesBySessionId.mockResolvedValue();
    this.studentSessionRepository.deleteStudentSessionsBySessionId.mockResolvedValue();
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
    this.sessionRepository.deleteSessionByTeacherId.mockResolvedValue();
  }

  whenGetCoursesFails() {
    this.courseRepository.getCoursesBySessionId.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenCascadeDeleteCalledInOrder() {
    expect(this.courseRepository.getCoursesBySessionId).toHaveBeenCalledWith(
      this.sessionId,
    );
    expect(
      this.questionsRepository.deleteQuestionsByCourseIds,
    ).toHaveBeenCalledWith(['course-1', 'course-2']);
    expect(
      this.courseFileRepository.deleteCoursesFilesByCourseIds,
    ).toHaveBeenCalledWith(['course-1', 'course-2']);
    const questionsOrder =
      this.questionsRepository.deleteQuestionsByCourseIds.mock
        .invocationCallOrder[0];
    const filesOrder =
      this.courseFileRepository.deleteCoursesFilesByCourseIds.mock
        .invocationCallOrder[0];
    expect(questionsOrder).toBeLessThan(filesOrder);
    expect(this.courseRepository.deleteCoursesBySessionId).toHaveBeenCalledWith(
      this.sessionId,
    );
    expect(
      this.studentSessionRepository.deleteStudentSessionsBySessionId,
    ).toHaveBeenCalledWith(this.sessionId);
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(
      this.userId,
    );
    expect(
      this.sessionRepository.deleteSessionByTeacherId,
    ).toHaveBeenCalledWith(this.sessionId, this.teacherId);
  }

  thenQuestionsAndFilesNotCalled() {
    expect(
      this.questionsRepository.deleteQuestionsByCourseIds,
    ).not.toHaveBeenCalled();
    expect(
      this.courseFileRepository.deleteCoursesFilesByCourseIds,
    ).not.toHaveBeenCalled();
  }

  thenCoursesAndLinksAndSessionDeleted() {
    expect(this.courseRepository.deleteCoursesBySessionId).toHaveBeenCalledWith(
      this.sessionId,
    );
    expect(
      this.studentSessionRepository.deleteStudentSessionsBySessionId,
    ).toHaveBeenCalledWith(this.sessionId);
    expect(
      this.sessionRepository.deleteSessionByTeacherId,
    ).toHaveBeenCalledWith(this.sessionId, this.teacherId);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
