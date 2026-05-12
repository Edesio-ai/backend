import { Inject } from '@nestjs/common';
import {
  TEACHER_REPOSITORY,
  type ITeacherRepository,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Teacher } from 'src/domain/teaching/teacher/types/teacher.type';

type CreateTeacherBody = {
  name: string;
  email: string;
};

export class CreateTeacherUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  async execute(
    userId: string,
    body: CreateTeacherBody,
  ): Promise<Teacher | null> {
    const { name, email } = body;

    const teacher = await this.teacherRepository.createTeacher(
      userId,
      name,
      email,
    );
    return teacher;
  }
}
