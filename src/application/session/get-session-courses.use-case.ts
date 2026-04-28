import { Inject } from '@nestjs/common';
import { SessionNotFoundError } from 'src/domain/auth/errors/auth.errors';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { EstablishmentNotFoundError } from 'src/domain/establishment/error';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from 'src/domain/teaching/interface/establishment.repository';
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
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(sessionId: string, user: AuthUser): Promise<Course[]> {
    switch (user.metadata.role) {
      case 'teacher':
        await this.checkTeacherOwnership(sessionId, user);
        break;
      case 'establishment':
        await this.checkEstablishmentOwnership(sessionId, user);
        break;
      default:
        throw new ForbiddenError(
          'You are not authorized to access this session',
        );
    }

    return this.courseRepository.getSessionCoursesBySessionId(sessionId);
  }

  private async checkTeacherOwnership(
    sessionId: string,
    user: AuthUser,
  ): Promise<void> {
    const teacher = await this.teachersRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
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
  }

  private async checkEstablishmentOwnership(
    sessionId: string,
    user: AuthUser,
  ): Promise<void> {
    const establishment =
      await this.establishmentRepository.getEstablishmentByUserId(user.id);
    if (!establishment) {
      throw new EstablishmentNotFoundError();
    }

    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      console.error(`Session not found for id ${sessionId}`);
      throw new SessionNotFoundError(`Session not found`);
    }

    const teacher = await this.teachersRepository.getTeacherByConditions({
      establishmentId: establishment.id,
      id: session.teacherId,
    });
    if (!teacher) {
      console.error(
        `Teacher not found for establishment id ${establishment.id} and session teacher id ${session.teacherId}`,
      );
      throw new NotFoundError('Teacher not found');
    }

    if (teacher.id !== session.teacherId) {
      console.error(
        `Teacher id ${teacher.id} does not match the session teacher id ${session.teacherId}`,
      );
      throw new ForbiddenError('You are not authorized to access this session');
    }
  }
}
