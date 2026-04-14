import { Inject } from '@nestjs/common';
import { SessionNotFoundError } from 'src/domain/auth/errors/auth.errors';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ForbiddenError } from 'src/domain/shared/errors/global.errors';
import {
  CourseNotFoundError,
  TeacherNotFoundError,
} from 'src/domain/teaching/error';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interface/session.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import { Course } from 'src/domain/teaching/types/course.type';

export class GetSessionCoursesUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teachersRepository: TeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(sessionId: string, user: AuthUser): Promise<Course[]> {
    const teacher = await this.teachersRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new TeacherNotFoundError();
    }

    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new SessionNotFoundError(`Session not found for id ${sessionId}`);
    }

    if (session.teacherId !== teacher.id) {
      const message = `Session teacher id ${session.teacherId} does not match the teacher id ${teacher.id}`;
      console.error(message);
      throw new ForbiddenError(message);
    }

    return this.courseRepository.getSessionCoursesBySessionId(sessionId);
  }
}
