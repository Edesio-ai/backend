import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { isCourseVisibleToStudents } from 'src/domain/teaching/course/course.utils';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';

export class GetCourseFileSignedUrlUseCase {
  constructor(
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(fileId: string, user: AuthUser): Promise<string | null> {
    const file = await this.courseFileRepository.getCourseFileById(fileId);
    if (!file) {
      throw new NotFoundError('Course file not found');
    }

    if (user.metadata.role === 'student') {
      await this.assertStudentCanAccessCourse(file.courseId, user);
    }

    return await this.courseFileRepository.getCourseFileSignedUrl(file.fileUrl);
  }

  private async assertStudentCanAccessCourse(courseId: string, user: AuthUser): Promise<void> {
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (!isCourseVisibleToStudents(course)) {
      throw new ForbiddenError('You are not authorized to access this course');
    }

    const student = await this.studentRepository.getStudentByUserId(user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const studentSession = await this.studentSessionRepository.getStudentSession(course.sessionId, student.id);
    if (!studentSession) {
      throw new ForbiddenError('You are not authorized to access this course');
    }
  }
}
