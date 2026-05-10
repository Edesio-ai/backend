import { Inject } from '@nestjs/common';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/interfaces/i-student-session.repository';
import { StudentJoinedSession } from 'src/domain/teaching/types/student.type';

export class GetStudentJoinedSessionsUseCase {
  constructor(
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(studentId: string): Promise<StudentJoinedSession[]> {
    return this.studentSessionRepository.listSessionsEnrolledByStudent(
      studentId,
    );
  }
}
