import { Inject } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import { Student } from 'src/domain/teaching/student/type/student.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';

export class CreateStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(user: AuthUser): Promise<Student> {
    return this.studentRepository.createStudent(user);
  }
}
