import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY, type IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import { type ITeacherRepository, TEACHER_REPOSITORY } from 'src/domain/teaching/teacher/contracts/teacher.repository';

export class DeleteTeacherUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByConditions({ id });

    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const authUserId = teacher.supabaseUserId ?? (await this.authRepository.getAuthUserIdByEmail(teacher.email));

    if (authUserId) {
      await this.authRepository.deleteAuthUser(authUserId);
    }

    await this.teacherRepository.deleteTeacher(id);
  }
}
