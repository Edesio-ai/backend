import {
  SessionStudent,
  StudentSession,
} from 'src/domain/teaching/types/student.type';
import { Inject } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interface/student.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interface/session.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from 'src/domain/teaching/interface/establishment.repository';

export class GetSessionStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(sessionId: string, user: AuthUser): Promise<SessionStudent[]> {
    const { role } = user.metadata;

    switch (role) {
      case 'teacher': {
        await this.verifyTeacherAccess(user.id, sessionId);
        break;
      }
      case 'establishment': {
        await this.verifyEstablishmentAccess(user.id, sessionId);
        break;
      }
    }

    const select = `
            joined_at,
            students (id, name, email, photo_url)
        `;
    const studentsSessions =
      await this.studentRepository.getStudentsSessionsById(sessionId, select);
    return studentsSessions;
  }

  private async verifyTeacherAccess(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    if (session.teacherId !== teacher.id) {
      throw new ForbiddenError(
        'You are not authorized to access to this session data',
      );
    }
  }

  private async verifyEstablishmentAccess(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const establishment =
      await this.establishmentRepository.getEstablishmentByUserId(userId);
    if (!establishment) {
      throw new NotFoundError('Establishment not found');
    }

    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      console.error(`Session not found for id ${sessionId}`);
      throw new NotFoundError(`Session not found`);
    }

    const teacher = await this.teacherRepository.getTeacherByConditions({
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
