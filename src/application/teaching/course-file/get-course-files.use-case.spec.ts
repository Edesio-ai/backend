import { GetCourseFilesUseCase } from './get-course-files.use-case';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { CourseFile } from 'src/domain/teaching/course-file/types/course-file.type';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import type { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import type { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { Course } from 'src/domain/teaching/course/types/course.type';

describe('GetCourseFilesUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return course files from repository for a teacher', async () => {
    fixtures.whenRepositoryReturnsFiles();

    const result = await fixtures.whenExecuteAsTeacher();

    expect(result).toEqual(fixtures.courseFiles);
    expect(fixtures.courseFileRepository.getCourseFilesByCourseId).toHaveBeenCalledWith(fixtures.courseId);
    expect(fixtures.courseRepository.getCourseById).not.toHaveBeenCalled();
  });

  it('should return course files for an enrolled student on a published course', async () => {
    fixtures.whenRepositoryReturnsFiles();
    fixtures.whenPublishedCourseFound();
    fixtures.whenStudentEnrolled();

    const result = await fixtures.whenExecuteAsStudent();

    expect(result).toEqual(fixtures.courseFiles);
    expect(fixtures.studentSessionRepository.getStudentSession).toHaveBeenCalledWith(
      fixtures.course.sessionId,
      fixtures.enrolledStudent.id,
    );
  });

  it('should throw ForbiddenError when the student is not enrolled', async () => {
    fixtures.whenPublishedCourseFound();
    fixtures.whenStudentFound();
    fixtures.studentSessionRepository.getStudentSession.mockResolvedValue(null);

    await expect(fixtures.whenExecuteAsStudent()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.courseFileRepository.getCourseFilesByCourseId).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when the course is not visible to students', async () => {
    fixtures.courseRepository.getCourseById.mockResolvedValue({
      ...fixtures.course,
      validatedQuestions: false,
    });

    await expect(fixtures.whenExecuteAsStudent()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.courseFileRepository.getCourseFilesByCourseId).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when the course is missing for a student', async () => {
    fixtures.courseRepository.getCourseById.mockResolvedValue(null);

    await expect(fixtures.whenExecuteAsStudent()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should propagate repository errors', async () => {
    fixtures.whenRepositoryThrows();

    const promise = fixtures.whenExecuteAsTeacher();

    await expect(promise).rejects.toBe(fixtures.repositoryError);
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly repositoryError = new Error('files query failed');

  public readonly course: Course = {
    id: this.courseId,
    sessionId: 'session-1',
    title: 'Suites',
    description: null,
    validatedQuestions: true,
  };

  public readonly teacherUser: AuthUser = {
    id: 'user-teacher-1',
    email: 't@school.com',
    metadata: { role: 'teacher' },
  };

  public readonly studentUser: AuthUser = {
    id: 'user-student-1',
    email: 's@school.com',
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

  public readonly courseFiles: CourseFile[] = [
    {
      id: 'f-1',
      courseId: this.courseId,
      fileUrl: 'path/a.pdf',
      fileName: 'a.pdf',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly studentSessionRepository: jest.Mocked<IStudentSessionRepository>;
  public readonly useCase: GetCourseFilesUseCase;

  constructor() {
    this.courseFileRepository = createMockCourseFileRepository();
    this.courseRepository = createMockCourseRepository();
    this.studentRepository = createMockStudentRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();

    this.useCase = new GetCourseFilesUseCase(
      this.courseFileRepository,
      this.courseRepository,
      this.studentRepository,
      this.studentSessionRepository,
    );
  }

  whenExecuteAsTeacher() {
    return this.useCase.execute(this.courseId, this.teacherUser);
  }

  whenExecuteAsStudent() {
    return this.useCase.execute(this.courseId, this.studentUser);
  }

  whenRepositoryReturnsFiles() {
    this.courseFileRepository.getCourseFilesByCourseId.mockResolvedValue(this.courseFiles);
  }

  whenRepositoryThrows() {
    this.courseFileRepository.getCourseFilesByCourseId.mockRejectedValue(this.repositoryError);
  }

  whenPublishedCourseFound() {
    this.courseRepository.getCourseById.mockResolvedValue(this.course);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.enrolledStudent);
  }

  whenStudentEnrolled() {
    this.whenStudentFound();
    this.studentSessionRepository.getStudentSession.mockResolvedValue({
      sessionId: this.course.sessionId,
      studentId: this.enrolledStudent.id,
    });
  }
}
