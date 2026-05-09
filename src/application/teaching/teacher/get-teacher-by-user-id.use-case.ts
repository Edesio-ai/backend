import { Inject } from '@nestjs/common';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interfaces/teacher.repository';
import { Teacher } from 'src/domain/teaching/types/teacher.type';

export class GetTeacherByUserIdUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
  ) {}

  async execute(userId: string): Promise<Teacher | null> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    return teacher;
  }
}
