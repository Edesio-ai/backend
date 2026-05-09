import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import { StudentPhotoUpload } from 'src/domain/teaching/types/student.type';

export class UploadStudentPhotoUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(user: AuthUser, payload: StudentPhotoUpload): Promise<string> {
    const { id: userId } = user;

    const student = await this.studentRepository.getStudentByUserId(userId);

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const ext = payload.originalFileName.split('.').pop() ?? 'bin';
    const storagePath = `${student.id}/${Date.now()}.${ext}`;
    const photoUrl = await this.studentRepository.storeStudentPhoto(
      payload.buffer,
      storagePath,
    );

    await this.studentRepository.updateStudentPhoto(student.id, photoUrl);

    return photoUrl;
  }
}
