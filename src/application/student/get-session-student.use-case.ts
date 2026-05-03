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

export class GetSessionStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(sessionId: string, userId: string): Promise<SessionStudent[]> {
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

    const select = `
            joined_at,
            students (id, name, email, photo_url)
        `;
    const studentsSessions =
      await this.studentRepository.getStudentsSessionsById(sessionId, select);
    return studentsSessions;
  }
}
