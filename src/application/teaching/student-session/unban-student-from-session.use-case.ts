import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { BadRequestError, ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';

export class UnbanStudentFromSessionUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(sessionId: string, studentId: string, user: AuthUser): Promise<void> {
    await this.verifyTeacherAccess(user.id, sessionId);

    const membership = await this.studentSessionRepository.getStudentSessionMembership(sessionId, studentId);
    if (!membership) {
      throw new NotFoundError('Student is not enrolled in this session');
    }
    if (membership.status !== 'banned') {
      throw new BadRequestError('Student is not banned from this session');
    }

    await this.studentSessionRepository.unbanStudentFromSession(sessionId, studentId);
  }

  private async verifyTeacherAccess(userId: string, sessionId: string): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    if (session.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to access to this session data');
    }
  }
}
