import { Inject } from '@nestjs/common';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Teacher } from 'src/domain/teaching/teacher/types/teacher.type';

export class GetTeacherByUserIdUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  async execute(userId: string): Promise<Teacher | null> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    return teacher;
  }
}
