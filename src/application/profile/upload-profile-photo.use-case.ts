import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY, type IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { PROFILE_REPOSITORY, type IProfileRepository } from 'src/domain/profile/contracts/i-profile.repository';
import {
  isProfilePhotoMimeType,
  PROFILE_PHOTO_EXTENSION_BY_MIME,
  PROFILE_PHOTO_MAX_BYTES,
  ProfilePhotoUpload,
} from 'src/domain/profile/types/profile.type';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';

export class UploadProfilePhotoUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(user: AuthUser, payload: ProfilePhotoUpload): Promise<string> {
    if (!isProfilePhotoMimeType(payload.mimeType)) {
      throw new BadRequestError('Invalid file type');
    }

    if (payload.byteLength > PROFILE_PHOTO_MAX_BYTES) {
      throw new BadRequestError('File too large');
    }

    const ext = PROFILE_PHOTO_EXTENSION_BY_MIME[payload.mimeType];
    const storagePath = `${user.id}/${Date.now()}.${ext}`;
    const photoUrl = await this.profileRepository.storeProfilePhoto(payload.buffer, storagePath);

    await this.authRepository.updateAuthUser(user.id, {
      metadata: {
        ...user.metadata,
        avatarUrl: photoUrl,
      },
    });

    if (user.metadata.role === 'student') {
      const student = await this.studentRepository.getStudentByUserId(user.id);
      if (student) {
        await this.studentRepository.updateStudentPhoto(student.id, photoUrl);
      }
    }

    return photoUrl;
  }
}
