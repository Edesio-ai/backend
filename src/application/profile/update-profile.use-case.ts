import { Inject } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from 'src/domain/auth/contracts/i-auth.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ESTABLISHMENT_REPOSITORY,
  type IEstablishmentRepository,
} from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import {
  type IStudentRepository,
  STUDENT_REPOSITORY,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import {
  type ITeacherRepository,
  TEACHER_REPOSITORY,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';

export type UpdateProfilePayload = {
  firstname: string;
  lastname: string;
  email: string;
};

export class UpdateProfileUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(
    user: AuthUser,
    updatePayload: UpdateProfilePayload,
  ): Promise<void> {
    const { firstname, lastname, email } = updatePayload;
    const { role } = user.metadata;

    const metadataUpdates: Record<string, unknown> = {
      ...user.metadata,
    };

    if (firstname) {
      metadataUpdates.firstname = firstname;
    }

    if (lastname) {
      metadataUpdates.lastname = lastname;
    }
    if (email && email !== user.email) {
      metadataUpdates.email = email.toLowerCase().trim();
    }

    const updateAuthUserPayload = {
      email,
      metadata: metadataUpdates,
    };

    await this.authRepository.updateAuthUser(user.id, updateAuthUserPayload);

    const payload = {
      name: `${firstname} ${lastname}`,
      email: email.toLowerCase().trim(),
    };

    switch (role) {
      case 'teacher':
        await this.teacherRepository.updateTeacher(user.id, payload);
        break;
      case 'establishment':
        await this.establishmentRepository.updateEstablishment(
          user.id,
          payload,
        );
        break;
      case 'student':
        await this.studentRepository.updateStudent(user.id, payload);
        break;
    }
  }
}
