import { Inject } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import { Student } from 'src/domain/teaching/student/type/student.type';

export class GetStudentByUserIdUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(userId: string): Promise<Student | null> {
    return this.studentRepository.getStudentByUserId(userId);
  }
}
