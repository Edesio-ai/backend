import { UploadStudentPhotoUseCase } from './upload-student-photo.use-case';
import { IStudentRepository } from 'src/domain/teaching/interface/student.repository';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  Student,
  StudentPhotoUpload,
} from 'src/domain/teaching/types/student.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';

describe('UploadStudentPhotoUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call getStudentByUserId with the user id', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStorePhotoSucceeds();
    fixtures.whenUpdatePhotoSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.studentRepository.getStudentByUserId).toHaveBeenCalledWith(
      fixtures.user.id,
    );
  });

  it('should throw NotFoundError when the student is not found', async () => {
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should not call storeStudentPhoto when student is not found', async () => {
    fixtures.whenStudentNotFound();

    await fixtures.whenExecute().catch(() => null);

    expect(fixtures.studentRepository.storeStudentPhoto).not.toHaveBeenCalled();
  });

  it('should call storeStudentPhoto with the buffer and a path derived from student id and file extension', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStorePhotoSucceeds();
    fixtures.whenUpdatePhotoSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.studentRepository.storeStudentPhoto).toHaveBeenCalledWith(
      fixtures.payload.buffer,
      expect.stringMatching(new RegExp(`^${fixtures.student.id}/\\d+\\.jpg$`)),
    );
  });

  it('should call updateStudentPhoto with the student id and returned photo url', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStorePhotoSucceeds();
    fixtures.whenUpdatePhotoSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.studentRepository.updateStudentPhoto).toHaveBeenCalledWith(
      fixtures.student.id,
      fixtures.photoUrl,
    );
  });

  it('should return the photo url', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStorePhotoSucceeds();
    fixtures.whenUpdatePhotoSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toBe(fixtures.photoUrl);
  });

  it('should propagate errors thrown by storeStudentPhoto', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStorePhotoFails(new Error('Storage error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('Storage error');
  });

  it('should propagate errors thrown by updateStudentPhoto', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStorePhotoSucceeds();
    fixtures.whenUpdatePhotoFails(new Error('DB error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('DB error');
  });
});

class Fixtures {
  public readonly photoUrl =
    'https://storage.example.com/profile-photos/student-1/1234567890.jpg';

  public readonly user: AuthUser = {
    id: 'user-1',
    email: 'alice@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'student' },
  };

  public readonly student: Student = {
    id: 'student-1',
    supabaseUserId: 'user-1',
    name: 'Alice Dupont',
    email: 'alice@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly payload: StudentPhotoUpload = {
    buffer: Buffer.from('fake-image-data'),
    originalFileName: 'avatar.jpg',
    mimeType: 'image/jpeg',
    byteLength: 15,
  };

  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly useCase: UploadStudentPhotoUseCase;

  constructor() {
    this.studentRepository = createMockStudentRepository();
    this.useCase = new UploadStudentPhotoUseCase(this.studentRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.user, this.payload);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.student);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenStorePhotoSucceeds() {
    this.studentRepository.storeStudentPhoto.mockResolvedValue(this.photoUrl);
  }

  whenStorePhotoFails(error: Error) {
    this.studentRepository.storeStudentPhoto.mockRejectedValue(error);
  }

  whenUpdatePhotoSucceeds() {
    this.studentRepository.updateStudentPhoto.mockResolvedValue(undefined);
  }

  whenUpdatePhotoFails(error: Error) {
    this.studentRepository.updateStudentPhoto.mockRejectedValue(error);
  }
}
