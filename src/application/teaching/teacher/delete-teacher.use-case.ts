import { Inject } from '@nestjs/common';
import { type ITeacherRepository, TEACHER_REPOSITORY } from 'src/domain/teaching/teacher/contracts/teacher.repository';

export class DeleteTeacherUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.teacherRepository.deleteTeacher(id);
  }
}
