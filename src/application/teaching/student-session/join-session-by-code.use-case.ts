import { Inject } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import {
  BadRequestError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';

export class JoinSessionByCodeUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(code: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.getSessionByCode(code);
    if (!session) {
      throw new NotFoundError();
    }

    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student) {
      throw new NotFoundError();
    }

    const studentSessions =
      await this.studentSessionRepository.listSessionsEnrolledByStudent(
        student.id,
      );

    const existingSession = studentSessions.find(
      (studentSession) => studentSession.id === session.id,
    );
    if (existingSession) {
      throw new BadRequestError('Student already joined this session');
    }

    await this.studentSessionRepository.createStudentSession(
      student.id,
      session.id,
    );
  }
}
