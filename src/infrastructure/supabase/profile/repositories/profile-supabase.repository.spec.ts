import { SupabaseClient } from '@supabase/supabase-js';
import { ProfileSupabaseRepository } from './profile-supabase.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';

describe('ProfileSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('storeProfilePhoto', () => {
    it('uploads then returns public URL', async () => {
      fixtures.whenUploadSucceeds();

      const url = await fixtures.whenStoreProfilePhoto();

      expect(url).toBe(fixtures.publicUrl);
      expect(fixtures.uploadMock).toHaveBeenCalledWith(fixtures.storagePath, fixtures.photoBuffer, { upsert: true });
    });

    it('throws ServerError when upload fails', async () => {
      fixtures.whenUploadFails();

      await expect(fixtures.whenStoreProfilePhoto()).rejects.toBeInstanceOf(ServerError);
    });

    it('returns empty string when publicUrl missing', async () => {
      fixtures.whenUploadSucceedsWithoutPublicUrl();

      const url = await fixtures.whenStoreProfilePhoto();

      expect(url).toBe('');
    });
  });
});

class Fixtures {
  public readonly storagePath = 'user-1/123.jpg';
  public readonly photoBuffer = Buffer.from('photo');
  public readonly publicUrl = 'https://storage.example.com/profile-photos/user-1/123.jpg';

  public readonly uploadMock = jest.fn();
  public readonly getPublicUrlMock = jest.fn();
  public readonly supabase: jest.Mocked<SupabaseClient>;
  public readonly repository: ProfileSupabaseRepository;

  constructor() {
    this.supabase = {
      storage: {
        from: jest.fn(),
      },
    } as unknown as jest.Mocked<SupabaseClient>;
    this.repository = new ProfileSupabaseRepository(this.supabase);
  }

  whenUploadSucceeds() {
    this.uploadMock.mockResolvedValue({ error: null });
    this.getPublicUrlMock.mockReturnValue({
      data: { publicUrl: this.publicUrl },
    });
    (this.supabase.storage.from as jest.Mock).mockReturnValue({
      upload: this.uploadMock,
      getPublicUrl: this.getPublicUrlMock,
    });
  }

  whenUploadFails() {
    this.uploadMock.mockResolvedValue({ error: { message: 'upload err' } });
    (this.supabase.storage.from as jest.Mock).mockReturnValue({
      upload: this.uploadMock,
      getPublicUrl: this.getPublicUrlMock,
    });
  }

  whenUploadSucceedsWithoutPublicUrl() {
    this.uploadMock.mockResolvedValue({ error: null });
    this.getPublicUrlMock.mockReturnValue({ data: { publicUrl: null } });
    (this.supabase.storage.from as jest.Mock).mockReturnValue({
      upload: this.uploadMock,
      getPublicUrl: this.getPublicUrlMock,
    });
  }

  whenStoreProfilePhoto() {
    return this.repository.storeProfilePhoto(this.photoBuffer, this.storagePath);
  }
}
