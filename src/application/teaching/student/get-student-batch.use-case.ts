import { Inject } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import { Student } from 'src/domain/teaching/types/student.type';

export class GetStudentBatchBody {
  studentIds: string[];
}

export class GetStudentBatchUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(body: GetStudentBatchBody): Promise<Student[]> {
    const { studentIds } = body;
    return await this.studentRepository.getStudentsByIds(studentIds);
  }
}
