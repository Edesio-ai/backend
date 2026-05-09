import { Inject } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import { StudentJoinedSession } from 'src/domain/teaching/types/student.type';

export class GetStudentJoinedSessionsUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(studentId: string): Promise<StudentJoinedSession[]> {
    return this.studentRepository.getStudentJoinedSessions(studentId);
  }
}
