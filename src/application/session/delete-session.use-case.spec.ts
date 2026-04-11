import { DeleteSessionUseCase } from './delete-session.use-case';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { QuestionsRepository } from '../../domain/teaching/interface/questions.repository';
import { SessionRepository } from '../../domain/teaching/interface/session.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';

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
    created_at: '2026-01-01T00:00:00.000Z',
    establishment_id: 'est-1',
    available_chatbots: 1,
  };

  public readonly repositoryError = new Error('db failed');

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly sessionRepository: jest.Mocked<SessionRepository>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: DeleteSessionUseCase;

  constructor() {
    this.courseRepository = {
      getCoursesBySessionId: jest.fn(),
      deleteCoursesFilesByCourseIds: jest.fn(),
      deleteCoursesBySessionId: jest.fn(),
    };
    this.questionsRepository = {
      deleteQuestionsByCourseIds: jest.fn(),
    };
    this.sessionRepository = {
      getSessionsByTeacherId: jest.fn(),
      getSessionByCode: jest.fn(),
      createSession: jest.fn(),
      updateSessionName: jest.fn(),
      deleteSessionByTeacherId: jest.fn(),
    };
    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
    };
    this.studentRepository = {
      getStudentsSessionsByIds: jest.fn(),
      deleteStudentSessionsBySessionId: jest.fn(),
    };
    this.useCase = new DeleteSessionUseCase(
      this.courseRepository,
      this.questionsRepository,
      this.sessionRepository,
      this.teacherRepository,
      this.studentRepository,
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
    this.courseRepository.deleteCoursesFilesByCourseIds.mockResolvedValue();
    this.courseRepository.deleteCoursesBySessionId.mockResolvedValue();
    this.studentRepository.deleteStudentSessionsBySessionId.mockResolvedValue();
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(
      this.teacher as any,
    );
    this.sessionRepository.deleteSessionByTeacherId.mockResolvedValue();
  }

  whenSessionHasNoCourses() {
    this.courseRepository.getCoursesBySessionId.mockResolvedValue([]);
    this.courseRepository.deleteCoursesBySessionId.mockResolvedValue();
    this.studentRepository.deleteStudentSessionsBySessionId.mockResolvedValue();
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(
      this.teacher as any,
    );
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
      this.courseRepository.deleteCoursesFilesByCourseIds,
    ).toHaveBeenCalledWith(['course-1', 'course-2']);
    const questionsOrder =
      this.questionsRepository.deleteQuestionsByCourseIds.mock
        .invocationCallOrder[0];
    const filesOrder =
      this.courseRepository.deleteCoursesFilesByCourseIds.mock
        .invocationCallOrder[0];
    expect(questionsOrder).toBeLessThan(filesOrder);
    expect(this.courseRepository.deleteCoursesBySessionId).toHaveBeenCalledWith(
      this.sessionId,
    );
    expect(
      this.studentRepository.deleteStudentSessionsBySessionId,
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
      this.courseRepository.deleteCoursesFilesByCourseIds,
    ).not.toHaveBeenCalled();
  }

  thenCoursesAndLinksAndSessionDeleted() {
    expect(this.courseRepository.deleteCoursesBySessionId).toHaveBeenCalledWith(
      this.sessionId,
    );
    expect(
      this.studentRepository.deleteStudentSessionsBySessionId,
    ).toHaveBeenCalledWith(this.sessionId);
    expect(
      this.sessionRepository.deleteSessionByTeacherId,
    ).toHaveBeenCalledWith(this.sessionId, this.teacherId);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
