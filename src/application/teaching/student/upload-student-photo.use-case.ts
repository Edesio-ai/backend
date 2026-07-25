import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import { StudentPhotoUpload } from 'src/domain/teaching/student/type/student.type';

export class UploadStudentPhotoUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(user: AuthUser, payload: StudentPhotoUpload): Promise<string> {
    const { id: userId } = user;

    const student = await this.studentRepository.getStudentByUserId(userId);

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const ext = payload.originalFileName.split('.').pop() ?? 'bin';
    const storagePath = `${student.id}/${Date.now()}.${ext}`;
    const photoUrl = await this.studentRepository.storeStudentPhoto(payload.buffer, storagePath);

    await this.studentRepository.updateStudentPhoto(student.id, photoUrl);

    return photoUrl;
  }
}
