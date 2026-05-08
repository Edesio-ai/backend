import { Inject } from '@nestjs/common';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import { Teacher } from 'src/domain/teaching/types/teacher.type';

type CreateTeacherBody = {
  name: string;
  email: string;
};

export class CreateTeacherUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
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
