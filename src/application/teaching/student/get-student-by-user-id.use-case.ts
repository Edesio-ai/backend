import { Inject } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interface/student.repository';
import { Student } from 'src/domain/teaching/types/student.type';

export class GetStudentByUserIdUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(userId: string): Promise<Student | null> {
    return this.studentRepository.getStudentByUserId(userId);
  }
}
