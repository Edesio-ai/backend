import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from 'src/domain/teaching/interfaces/establishment.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/interfaces/i-student-session.repository';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interfaces/session.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interfaces/teacher.repository';
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
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(sessionId: string, user: AuthUser): Promise<Course[]> {
    const { role } = user.metadata;

    switch (role) {
      case 'teacher':
        await this.checkTeacherOwnership(sessionId, user);
        break;
      case 'establishment':
        await this.checkEstablishmentOwnership(sessionId, user);
        break;
      case 'student':
        await this.checkStudentOwnership(sessionId, user);
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
      throw new NotFoundError(`Session not found for id ${sessionId}`);
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
      throw new NotFoundError('Establishment not found');
    }

    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      console.error(`Session not found for id ${sessionId}`);
      throw new NotFoundError(`Session not found`);
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

  private async checkStudentOwnership(
    sessionId: string,
    user: AuthUser,
  ): Promise<void> {
    const student = await this.studentRepository.getStudentByUserId(user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const studentSession =
      await this.studentSessionRepository.getStudentSessionBySessionId(
        sessionId,
      );
    if (!studentSession) {
      throw new NotFoundError(`Session not found for id ${sessionId}`);
    }

    if (studentSession.studentId !== student.id) {
      throw new ForbiddenError('You are not authorized to access this session');
    }
  }
}
