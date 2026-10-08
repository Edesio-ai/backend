import { UploadProfilePhotoUseCase } from './upload-profile-photo.use-case';
import type { IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { IProfileRepository } from 'src/domain/profile/contracts/i-profile.repository';
import { ProfilePhotoUpload } from 'src/domain/profile/types/profile.type';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import type { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import { Student } from 'src/domain/teaching/student/type/student.type';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';

describe('UploadProfilePhotoUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('stores the photo then updates auth metadata with avatarUrl', async () => {
    fixtures.whenStorePhotoSucceeds();
    fixtures.whenUpdateAuthUserSucceeds();

    const result = await fixtures.whenExecute();

    expect(fixtures.profileRepository.storeProfilePhoto).toHaveBeenCalledWith(
      fixtures.payload.buffer,
      expect.stringMatching(new RegExp(`^${fixtures.user.id}/\\d+\\.jpg$`)),
    );
    expect(fixtures.authRepository.updateAuthUser).toHaveBeenCalledWith(fixtures.user.id, {
      metadata: {
        role: 'teacher',
        firstname: 'Ada',
        lastname: 'Lovelace',
        avatarUrl: fixtures.photoUrl,
      },
    });
    expect(fixtures.studentRepository.getStudentByUserId).not.toHaveBeenCalled();
    expect(result).toBe(fixtures.photoUrl);
  });

  it('also updates the student photo when role is student', async () => {
    fixtures.givenStudentRole();
    fixtures.whenStorePhotoSucceeds();
    fixtures.whenUpdateAuthUserSucceeds();
    fixtures.whenStudentFound();
    fixtures.whenUpdateStudentPhotoSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.studentRepository.getStudentByUserId).toHaveBeenCalledWith(fixtures.user.id);
    expect(fixtures.studentRepository.updateStudentPhoto).toHaveBeenCalledWith(fixtures.student.id, fixtures.photoUrl);
  });

  it('does not fail when student role has no student row', async () => {
    fixtures.givenStudentRole();
    fixtures.whenStorePhotoSucceeds();
    fixtures.whenUpdateAuthUserSucceeds();
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).resolves.toBe(fixtures.photoUrl);
    expect(fixtures.studentRepository.updateStudentPhoto).not.toHaveBeenCalled();
  });

  it('throws BadRequestError when mime type is not allowed', async () => {
    fixtures.payload.mimeType = 'application/pdf';

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.profileRepository.storeProfilePhoto).not.toHaveBeenCalled();
  });

  it('throws BadRequestError when file is too large', async () => {
    fixtures.payload.byteLength = 5 * 1024 * 1024 + 1;

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.profileRepository.storeProfilePhoto).not.toHaveBeenCalled();
  });

  it('propagates errors thrown by storeProfilePhoto', async () => {
    fixtures.whenStorePhotoFails(new Error('Storage error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('Storage error');
    expect(fixtures.authRepository.updateAuthUser).not.toHaveBeenCalled();
  });
});

class Fixtures {
  public readonly photoUrl = 'https://storage.example.com/profile-photos/user-1/1234567890.jpg';

  public user: AuthUser = {
    id: 'user-1',
    email: 'ada@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher', firstname: 'Ada', lastname: 'Lovelace' },
  };

  public readonly student: Student = {
    id: 'student-1',
    supabaseUserId: 'user-1',
    name: 'Ada Lovelace',
    email: 'ada@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public payload: ProfilePhotoUpload = {
    buffer: Buffer.from('fake-image-data'),
    originalFileName: 'avatar.jpg',
    mimeType: 'image/jpeg',
    byteLength: 15,
  };

  public readonly profileRepository: jest.Mocked<IProfileRepository>;
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly useCase: UploadProfilePhotoUseCase;

  constructor() {
    this.profileRepository = {
      storeProfilePhoto: jest.fn(),
    };
    this.authRepository = createMockAuthRepository();
    this.studentRepository = createMockStudentRepository();
    this.useCase = new UploadProfilePhotoUseCase(this.profileRepository, this.authRepository, this.studentRepository);
  }

  givenStudentRole() {
    this.user = {
      ...this.user,
      metadata: { ...this.user.metadata, role: 'student' },
    };
  }

  whenExecute() {
    return this.useCase.execute(this.user, this.payload);
  }

  whenStorePhotoSucceeds() {
    this.profileRepository.storeProfilePhoto.mockResolvedValue(this.photoUrl);
  }

  whenStorePhotoFails(error: Error) {
    this.profileRepository.storeProfilePhoto.mockRejectedValue(error);
  }

  whenUpdateAuthUserSucceeds() {
    this.authRepository.updateAuthUser.mockResolvedValue(undefined);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.student);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenUpdateStudentPhotoSucceeds() {
    this.studentRepository.updateStudentPhoto.mockResolvedValue(undefined);
  }
}
