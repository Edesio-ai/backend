import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import {
  COURSE_REPOSITORY,
  type ICourseRepository,
} from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  ESTABLISHMENT_REPOSITORY,
  type IEstablishmentRepository,
} from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import {
  TEACHER_REPOSITORY,
  type ITeacherRepository,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Course } from 'src/domain/teaching/course/types/course.type';

export class GetSessionCoursesUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teachersRepository: ITeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
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
