import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interface/student.repository';

export class DeleteStudentSessionUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(sessionId: string, user: AuthUser): Promise<void> {
    const student = await this.studentRepository.getStudentByUserId(user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const studentSession =
      await this.studentRepository.getStudentSessionBySessionId(sessionId);
    if (!studentSession) {
      throw new NotFoundError('Student session not found');
    }

    if (studentSession.studentId !== student.id) {
      throw new ForbiddenError(
        'You are not authorized to delete this student session',
      );
    }

    await this.studentRepository.deleteStudentSession(sessionId, student.id);
  }
}
