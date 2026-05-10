import { Inject } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interfaces/session.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import {
  BadRequestError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/interfaces/i-student-session.repository';

export class JoinSessionByCodeUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
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
