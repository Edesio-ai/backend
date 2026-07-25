import { UpdateCourseUseCase, UpdateCourseBody } from './update-course.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { NotFoundError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { Course } from 'src/domain/teaching/course/types/course.type';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('UpdateCourseUseCase', () => {
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
    expect(fixtures.courseRepository.updateCourse).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when course belongs to another teacher', async () => {
    fixtures.whenCourseFoundWithOtherTeacher();
    fixtures.whenTeacherFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fixtures.courseRepository.updateCourse).not.toHaveBeenCalled();
  });

  it('should call updateCourse with expected payload and return updated course', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenUpdateSucceeds();

    const result = await fixtures.whenExecute();

    expect(fixtures.courseRepository.updateCourse).toHaveBeenCalledWith(fixtures.courseId, fixtures.body);
    expect(fixtures.courseRepository.updateCourse).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fixtures.updatedCourse);
  });

  it('should pass only provided fields to updateCourse', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenUpdateSucceeds();

    await fixtures.whenExecute({ title: 'Seul le titre' });

    expect(fixtures.courseRepository.updateCourse).toHaveBeenCalledWith(fixtures.courseId, { title: 'Seul le titre' });
  });

  it('should pass positionOrder to updateCourse', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenUpdateSucceeds();

    await fixtures.whenExecute({ positionOrder: 2 });

    expect(fixtures.courseRepository.updateCourse).toHaveBeenCalledWith(fixtures.courseId, { positionOrder: 2 });
  });

  it('should propagate errors thrown by updateCourse', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenUpdateFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);
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
    supabaseUserId: 'user-1',
  };

  public readonly body: UpdateCourseBody = {
    title: 'Titre mis à jour',
    description: 'Nouvelle description',
    contentText: null,
  };

  public readonly updatedCourse: Course = {
    id: this.courseId,
    sessionId: 'session-1',
    title: 'Titre mis à jour',
    description: 'Nouvelle description',
    contentText: null,
    validatedQuestions: false,
    positionOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly repositoryError = new Error('update failed');

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly useCase: UpdateCourseUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.useCase = new UpdateCourseUseCase(this.courseRepository, this.teacherRepository);
  }

  whenExecute(body: UpdateCourseBody = this.body) {
    return this.useCase.execute(this.courseId, body, this.user);
  }

  whenCourseFound() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: this.teacher.id },
      teachers: {},
    });
  }

  whenCourseFoundWithOtherTeacher() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher' },
      teachers: {},
    });
  }

  whenCourseNotFound() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue(null);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenUpdateSucceeds() {
    this.courseRepository.updateCourse.mockResolvedValue(this.updatedCourse);
  }

  whenUpdateFails() {
    this.courseRepository.updateCourse.mockRejectedValue(this.repositoryError);
  }
}
