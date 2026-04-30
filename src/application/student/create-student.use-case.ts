import { Inject } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interface/student.repository';
import { Student } from 'src/domain/teaching/types/student.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';

export class CreateStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(user: AuthUser): Promise<Student> {
    return this.studentRepository.createStudent(user);
  }
}
