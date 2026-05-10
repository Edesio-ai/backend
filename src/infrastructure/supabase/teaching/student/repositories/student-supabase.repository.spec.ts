import { SupabaseClient } from '@supabase/supabase-js';
import { StudentSupabaseRepository } from './student-supabase.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import type { AuthUser } from 'src/domain/auth/types/auth.type';

describe('StudentSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('getStudentByUserId', () => {
    it('returns mapped student when row exists', async () => {
      fixtures.whenGetStudentByUserIdReturnsRow();

      const result = await fixtures.whenGetStudentByUserId();

      expect(result).toEqual(fixtures.expectedStudent);
      fixtures.thenGetStudentByUserIdChainBuilt();
    });

    it('returns null when maybeSingle has no row', async () => {
      fixtures.whenGetStudentByUserIdReturnsNull();

      const result = await fixtures.whenGetStudentByUserId();

      expect(result).toBeNull();
      fixtures.thenGetStudentByUserIdChainBuilt();
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenGetStudentByUserIdFails();

      await expect(fixtures.whenGetStudentByUserId()).rejects.toBeInstanceOf(
        ServerError,
      );
    });
  });

  describe('createStudent', () => {
    it('inserts and returns mapped student', async () => {
      fixtures.whenCreateStudentInsertSucceeds();

      const result = await fixtures.whenCreateStudent(fixtures.authUser);

      expect(result).toEqual(fixtures.expectedStudent);
      fixtures.thenCreateStudentInsertCalledWithSnakeCaseFromFullName();
    });

    it('sets name from firstname and lastname metadata', async () => {
      fixtures.whenCreateStudentInsertSucceeds();

      await fixtures.whenCreateStudent(fixtures.authUser);

      expect(fixtures.insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice Dupont' }),
      );
    });

    it('uses only firstname when lastname missing', async () => {
      fixtures.whenCreateStudentInsertSucceeds();

      await fixtures.whenCreateStudent({
        ...fixtures.authUser,
        metadata: { firstname: 'Alice' },
      });

      expect(fixtures.insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice' }),
      );
    });

    it('defaults name to Élève when no firstname', async () => {
      fixtures.whenCreateStudentInsertSucceeds();

      await fixtures.whenCreateStudent({
        ...fixtures.authUser,
        metadata: {},
      });

      expect(fixtures.insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Élève' }),
      );
    });

    it('throws ServerError when insert fails', async () => {
      fixtures.whenCreateStudentInsertFails();

      await expect(
        fixtures.whenCreateStudent(fixtures.authUser),
      ).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('getStudentsByIds', () => {
    it('returns mapped students for ids', async () => {
      fixtures.whenGetStudentsByIdsReturnsRows();

      const result = await fixtures.whenGetStudentsByIds(fixtures.studentIds);

      expect(result).toEqual(fixtures.expectedStudents);
      fixtures.thenGetStudentsByIdsChainBuilt(fixtures.studentIds);
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenGetStudentsByIdsFails();

      await expect(
        fixtures.whenGetStudentsByIds(fixtures.studentIds),
      ).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('storeStudentPhoto', () => {
    it('uploads then returns public URL', async () => {
      fixtures.whenUploadSucceeds();

      const url = await fixtures.whenStoreStudentPhoto();

      expect(url).toBe(fixtures.publicUrl);
      expect(fixtures.uploadMock).toHaveBeenCalledWith(
        fixtures.storagePath,
        fixtures.photoBuffer,
        { upsert: true },
      );
    });

    it('throws ServerError when upload fails', async () => {
      fixtures.whenUploadFails();

      await expect(fixtures.whenStoreStudentPhoto()).rejects.toBeInstanceOf(
        ServerError,
      );
    });

    it('returns empty string when publicUrl missing', async () => {
      fixtures.whenUploadSucceedsWithoutPublicUrl();

      const url = await fixtures.whenStoreStudentPhoto();

      expect(url).toBe('');
    });
  });

  describe('updateStudentPhoto', () => {
    it('updates photo_url for student id', async () => {
      fixtures.whenUpdatePhotoSucceeds();

      await fixtures.whenUpdateStudentPhoto();

      expect(fixtures.updateMock).toHaveBeenCalledWith({
        photo_url: fixtures.photoUrl,
      });
      expect(fixtures.eqMock).toHaveBeenCalledWith('id', fixtures.studentId);
    });

    it('throws ServerError when update fails', async () => {
      fixtures.whenUpdatePhotoFails();

      await expect(fixtures.whenUpdateStudentPhoto()).rejects.toBeInstanceOf(
        ServerError,
      );
    });
  });
});

class Fixtures {
  public readonly userId = 'user-supabase-1';
  public readonly studentIds = ['stu-1', 'stu-2'];
  public readonly studentId = 'stu-1';
  public readonly photoUrl = 'https://cdn.example/p.png';
  public readonly storagePath = 'students/stu-1.jpg';
  public readonly publicUrl =
    'https://storage.example/public/students/stu-1.jpg';
  public readonly photoBuffer = Buffer.from([1, 2, 3]);

  public readonly supabaseRow = {
    id: this.studentId,
    supabase_user_id: this.userId,
    name: 'Alice Dupont',
    email: 'alice@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    photo_url: '',
  };

  public readonly expectedStudent = {
    id: this.studentId,
    supabaseUserId: this.userId,
    name: 'Alice Dupont',
    email: 'alice@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly secondRow = {
    ...this.supabaseRow,
    id: 'stu-2',
    name: 'Bob',
    email: 'bob@school.com',
  };

  public readonly expectedStudents = [
    this.expectedStudent,
    {
      id: 'stu-2',
      supabaseUserId: this.userId,
      name: 'Bob',
      email: 'bob@school.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      photoUrl: '',
    },
  ];

  public readonly authUser: AuthUser = {
    id: this.userId,
    email: 'alice@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: {
      firstname: 'Alice',
      lastname: 'Dupont',
      role: 'student',
    },
  };

  public readonly supabase: {
    from: jest.Mock;
    storage: { from: jest.Mock };
  };

  public readonly insertMock = jest.fn();
  public readonly uploadMock = jest.fn();
  public readonly getPublicUrlMock = jest.fn();
  public readonly updateMock = jest.fn();
  public readonly eqMock = jest.fn();

  public repository: StudentSupabaseRepository;

  constructor() {
    this.supabase = {
      from: jest.fn(),
      storage: {
        from: jest.fn(),
      },
    };
    this.repository = new StudentSupabaseRepository(
      this.supabase as unknown as SupabaseClient,
    );
  }

  whenGetStudentByUserIdReturnsRow() {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: this.supabaseRow, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ select });
  }

  whenGetStudentByUserIdReturnsNull() {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ select });
  }

  whenGetStudentByUserIdFails() {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'db down' } });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ select });
  }

  whenCreateStudentInsertSucceeds() {
    const single = jest
      .fn()
      .mockResolvedValue({ data: this.supabaseRow, error: null });
    const selectAfterInsert = jest.fn().mockReturnValue({ single });
    this.insertMock.mockReturnValue({ select: selectAfterInsert });
    this.supabase.from.mockReturnValue({ insert: this.insertMock });
  }

  whenCreateStudentInsertFails() {
    const single = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'insert failed' } });
    const selectAfterInsert = jest.fn().mockReturnValue({ single });
    this.insertMock.mockReturnValue({ select: selectAfterInsert });
    this.supabase.from.mockReturnValue({ insert: this.insertMock });
  }

  whenGetStudentsByIdsReturnsRows() {
    const inFn = jest.fn().mockResolvedValue({
      data: [this.supabaseRow, this.secondRow],
      error: null,
    });
    const select = jest.fn().mockReturnValue({ in: inFn });
    this.supabase.from.mockReturnValue({ select });
  }

  whenGetStudentsByIdsFails() {
    const inFn = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'in query failed' },
    });
    const select = jest.fn().mockReturnValue({ in: inFn });
    this.supabase.from.mockReturnValue({ select });
  }

  whenUploadSucceeds() {
    this.uploadMock.mockResolvedValue({ error: null });
    this.getPublicUrlMock.mockReturnValue({
      data: { publicUrl: this.publicUrl },
    });
    this.supabase.storage.from.mockReturnValue({
      upload: this.uploadMock,
      getPublicUrl: this.getPublicUrlMock,
    });
  }

  whenUploadFails() {
    this.uploadMock.mockResolvedValue({ error: { message: 'upload err' } });
    this.supabase.storage.from.mockReturnValue({
      upload: this.uploadMock,
      getPublicUrl: this.getPublicUrlMock,
    });
  }

  whenUploadSucceedsWithoutPublicUrl() {
    this.uploadMock.mockResolvedValue({ error: null });
    this.getPublicUrlMock.mockReturnValue({ data: { publicUrl: null } });
    this.supabase.storage.from.mockReturnValue({
      upload: this.uploadMock,
      getPublicUrl: this.getPublicUrlMock,
    });
  }

  whenUpdatePhotoSucceeds() {
    this.eqMock.mockResolvedValue({ error: null });
    this.updateMock.mockReturnValue({ eq: this.eqMock });
    this.supabase.from.mockReturnValue({ update: this.updateMock });
  }

  whenUpdatePhotoFails() {
    this.eqMock.mockResolvedValue({ error: { message: 'update failed' } });
    this.updateMock.mockReturnValue({ eq: this.eqMock });
    this.supabase.from.mockReturnValue({ update: this.updateMock });
  }

  whenGetStudentByUserId() {
    return this.repository.getStudentByUserId(this.userId);
  }

  whenCreateStudent(user: AuthUser) {
    return this.repository.createStudent(user);
  }

  whenGetStudentsByIds(ids: string[]) {
    return this.repository.getStudentsByIds(ids);
  }

  whenStoreStudentPhoto() {
    return this.repository.storeStudentPhoto(
      this.photoBuffer,
      this.storagePath,
    );
  }

  whenUpdateStudentPhoto() {
    return this.repository.updateStudentPhoto(this.studentId, this.photoUrl);
  }

  thenGetStudentByUserIdChainBuilt() {
    expect(this.supabase.from).toHaveBeenCalledWith('students');
    const select = this.supabase.from.mock.results[0].value.select;
    expect(select).toHaveBeenCalledWith('*');
    const eq = select.mock.results[0].value.eq;
    expect(eq).toHaveBeenCalledWith('supabase_user_id', this.userId);
  }

  thenCreateStudentInsertCalledWithSnakeCaseFromFullName() {
    expect(this.supabase.from).toHaveBeenCalledWith('students');
    expect(this.insertMock).toHaveBeenCalledWith({
      supabase_user_id: this.userId,
      name: 'Alice Dupont',
      email: 'alice@school.com',
    });
  }

  thenGetStudentsByIdsChainBuilt(ids: string[]) {
    expect(this.supabase.from).toHaveBeenCalledWith('students');
    const select = this.supabase.from.mock.results[0].value.select;
    expect(select).toHaveBeenCalledWith('*');
    const inFn = select.mock.results[0].value.in;
    expect(inFn).toHaveBeenCalledWith('id', ids);
  }
}
