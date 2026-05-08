import { DeleteCourseUseCase } from './delete-course.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  NotFoundError,
  UnauthorizedError,
} from 'src/domain/shared/global/errors/global.errors';
import { CourseRepository } from 'src/domain/teaching/interface/course.repository';
import { QuestionsRepository } from 'src/domain/teaching/interface/questions.repository';
import { StudentRepository } from 'src/domain/teaching/interface/student.repository';
import { TeacherRepository } from 'src/domain/teaching/interface/teacher.repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';

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

  it('should delete quiz questions, files, stats, questions and course in order', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenDeleteSucceeds();

    await fixtures.whenExecute();

    expect(
      fixtures.questionsRepository.deleteCourseQuizQuestions,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.courseRepository.deleteCoursesFilesByCourseIds,
    ).toHaveBeenCalledWith([fixtures.courseId]);
    expect(
      fixtures.studentRepository.deleteStudentCourseStatsByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseId);
    expect(
      fixtures.questionsRepository.deleteCourseQuestionsByCourseId,
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
      fixtures.courseRepository.deleteCoursesFilesByCourseIds as jest.Mock
    ).mockImplementation(async () => {
      callOrder.push('deleteCoursesFilesByCourseIds');
    });
    (
      fixtures.studentRepository.deleteStudentCourseStatsByCourseId as jest.Mock
    ).mockImplementation(async () => {
      callOrder.push('deleteStudentCourseStatsByCourseId');
    });
    (
      fixtures.questionsRepository.deleteCourseQuestionsByCourseId as jest.Mock
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

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: DeleteCourseUseCase;

  constructor() {
    this.courseRepository = {
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
      getFileBufferFromStorage: jest.fn(),
      deleteCourseById: jest.fn(),
      updateCourse: jest.fn(),
    };

    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
      getTeacherByConditions: jest.fn(),
    };

    this.questionsRepository = {
      getQuestionById: jest.fn(),
      deleteQuestionById: jest.fn(),
      insertQuestions: jest.fn(),
      insertQuestion: jest.fn(),
      deleteQuestionsByCourseIds: jest.fn(),
      getPendingQuestionCount: jest.fn(),
      getCourseQuestions: jest.fn(),
      deleteCourseQuizQuestions: jest.fn(),
      updateQuestionById: jest.fn(),
      deleteCourseQuestionsByCourseId: jest.fn(),
      getAnsweredQuestionCount: jest.fn(),
    };

    this.studentRepository = createMockStudentRepository();

    this.useCase = new DeleteCourseUseCase(
      this.courseRepository,
      this.teacherRepository,
      this.questionsRepository,
      this.studentRepository,
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
    this.courseRepository.deleteCoursesFilesByCourseIds.mockResolvedValue(
      undefined,
    );
    this.studentRepository.deleteStudentCourseStatsByCourseId.mockResolvedValue(
      undefined,
    );
    this.questionsRepository.deleteCourseQuestionsByCourseId.mockResolvedValue(
      undefined,
    );
    this.courseRepository.deleteCourseById.mockResolvedValue(undefined);
  }
}
