import { Inject } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import { Student } from 'src/domain/teaching/student/type/student.type';

export class GetStudentBatchBody {
  studentIds: string[];
}

export class GetStudentBatchUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(body: GetStudentBatchBody): Promise<Student[]> {
    const { studentIds } = body;
    return await this.studentRepository.getStudentsByIds(studentIds);
  }
}
