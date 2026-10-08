import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Course } from 'src/domain/teaching/course/types/course.type';
import type { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { CourseFile } from 'src/domain/teaching/course-file/types/course-file.type';
import type { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';
import { GetCourseFileSignedUrlUseCase } from './get-course-file-signed-url.use-case';

describe('GetCourseFileSignedUrlUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('returns a signed URL for a teacher', async () => {
    fixtures.whenFileFound();
    fixtures.courseFileRepository.getCourseFileSignedUrl.mockResolvedValue('https://signed.example/doc');

    await expect(fixtures.whenExecuteAsTeacher()).resolves.toBe('https://signed.example/doc');
    expect(fixtures.courseFileRepository.getCourseFileSignedUrl).toHaveBeenCalledWith(fixtures.file.fileUrl);
  });

  it('returns a signed URL for an enrolled student', async () => {
    fixtures.whenFileFound();
    fixtures.whenPublishedCourseFound();
    fixtures.whenStudentEnrolled();
    fixtures.courseFileRepository.getCourseFileSignedUrl.mockResolvedValue('https://signed.example/doc');

    await expect(fixtures.whenExecuteAsStudent()).resolves.toBe('https://signed.example/doc');
  });

  it('throws NotFoundError when the file is missing', async () => {
    fixtures.courseFileRepository.getCourseFileById.mockResolvedValue(null);

    await expect(fixtures.whenExecuteAsStudent()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.courseFileRepository.getCourseFileSignedUrl).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when the student is not enrolled', async () => {
    fixtures.whenFileFound();
    fixtures.whenPublishedCourseFound();
    fixtures.studentRepository.getStudentByUserId.mockResolvedValue(fixtures.enrolledStudent);
    fixtures.studentSessionRepository.getStudentSession.mockResolvedValue(null);

    await expect(fixtures.whenExecuteAsStudent()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.courseFileRepository.getCourseFileSignedUrl).not.toHaveBeenCalled();
  });
});

class Fixtures {
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

  public readonly course: Course = {
    id: 'course-1',
    sessionId: 'session-1',
    title: 'Suites',
    description: null,
    validatedQuestions: true,
  };

  public readonly file: CourseFile = {
    id: 'file-1',
    courseId: this.course.id,
    fileUrl: 'course-1/doc.pdf',
    fileName: 'doc.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly enrolledStudent = {
    id: 'student-1',
    supabaseUserId: this.studentUser.id,
    name: 'Élève',
    email: 's@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly courseFileRepository: jest.Mocked<ICourseFileRepository>;
  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly studentSessionRepository: jest.Mocked<IStudentSessionRepository>;
  public readonly useCase: GetCourseFileSignedUrlUseCase;

  constructor() {
    this.courseFileRepository = createMockCourseFileRepository();
    this.courseRepository = createMockCourseRepository();
    this.studentRepository = createMockStudentRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.useCase = new GetCourseFileSignedUrlUseCase(
      this.courseFileRepository,
      this.courseRepository,
      this.studentRepository,
      this.studentSessionRepository,
    );
  }

  whenExecuteAsTeacher() {
    return this.useCase.execute(this.file.id, this.teacherUser);
  }

  whenExecuteAsStudent() {
    return this.useCase.execute(this.file.id, this.studentUser);
  }

  whenFileFound() {
    this.courseFileRepository.getCourseFileById.mockResolvedValue(this.file);
  }

  whenPublishedCourseFound() {
    this.courseRepository.getCourseById.mockResolvedValue(this.course);
  }

  whenStudentEnrolled() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.enrolledStudent);
    this.studentSessionRepository.getStudentSession.mockResolvedValue({
      sessionId: this.course.sessionId,
      studentId: this.enrolledStudent.id,
    });
  }
}
