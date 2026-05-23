import { SupabaseClient } from '@supabase/supabase-js';
import { SelfLearnerCourseFileRepository } from './self-learner-course-file.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { selfLearnerCourseFileMapper } from '../mappers/self-learner-course-file.mapper';

describe('SelfLearnerCourseFileRepository', () => {
  describe('uploadSelfLearnerCourseFile', () => {
    let fixtures: UploadFixtures;

    beforeEach(() => {
      fixtures = new UploadFixtures();
    });

    it('inserts mapped payload and returns domain row', async () => {
      fixtures.whenInsertSucceeds();

      const result = await fixtures.whenUpload();

      expect(result).toEqual(
        selfLearnerCourseFileMapper.toDomain(fixtures.supabaseRow),
      );
      expect(fixtures.insertMock).toHaveBeenCalledWith(
        selfLearnerCourseFileMapper.toInsert(fixtures.payload),
      );
      expect(fixtures.singleAfterInsertMock).toHaveBeenCalledTimes(1);
    });

    it('throws ServerError when insert fails', async () => {
      fixtures.whenInsertFails('violates FK');

      await expect(fixtures.whenUpload()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('getSelfLearnerCourseFiles', () => {
    let fixtures: ListFixtures;

    beforeEach(() => {
      fixtures = new ListFixtures();
    });

    it('maps rows when query succeeds', async () => {
      fixtures.whenListSucceedsWithRows([fixtures.rows[0]]);

      const result = await fixtures.whenList();

      expect(result).toEqual([
        selfLearnerCourseFileMapper.toDomain(fixtures.rows[0]),
      ]);
      fixtures.thenListChainBuilt(fixtures.courseId);
    });

    it('returns empty array when data is null', async () => {
      fixtures.whenListReturnsNull();

      const result = await fixtures.whenList();

      expect(result).toEqual([]);
      fixtures.thenListChainBuilt(fixtures.courseId);
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenListFails('down');

      await expect(fixtures.whenList()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('getSelfLearnerCourseFilesUrls', () => {
    let fixtures: UrlsFixtures;

    beforeEach(() => {
      fixtures = new UrlsFixtures();
    });

    it('maps file_url rows to string array', async () => {
      fixtures.whenUrlsQuerySucceeds([
        { file_url: 'u1.pdf' },
        { file_url: 'u2.pdf' },
      ]);

      await expect(fixtures.whenGetUrls()).resolves.toEqual([
        'u1.pdf',
        'u2.pdf',
      ]);

      expect(fixtures.fromMock).toHaveBeenCalledWith(
        'self_learner_course_files',
      );
      expect(fixtures.selectMock).toHaveBeenCalledWith('file_url');
      expect(fixtures.eqMock).toHaveBeenCalledWith(
        'course_id',
        fixtures.courseId,
      );
    });

    it('returns empty when data is null', async () => {
      fixtures.whenUrlsReturnsNullData();

      await expect(fixtures.whenGetUrls()).resolves.toEqual([]);
      expect(fixtures.eqMock).toHaveBeenCalledWith(
        'course_id',
        fixtures.courseId,
      );
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenUrlsFails('down');

      await expect(fixtures.whenGetUrls()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('deleteSelfLearnerCourseFilesByCourseId', () => {
    let fixtures: DeleteFilesFixtures;

    beforeEach(() => {
      fixtures = new DeleteFilesFixtures();
    });

    it('runs delete constrained by course_id', async () => {
      fixtures.whenDeleteSucceeds();

      await fixtures.whenDeleteFiles();

      expect(fixtures.fromMock).toHaveBeenCalledWith(
        'self_learner_course_files',
      );
      expect(fixtures.deleteMock).toHaveBeenCalledTimes(1);
      expect(fixtures.eqAfterDeleteMock).toHaveBeenCalledWith(
        'course_id',
        fixtures.courseId,
      );
    });

    it('throws ServerError when delete fails', async () => {
      fixtures.whenDeleteFails('rls');

      await expect(fixtures.whenDeleteFiles()).rejects.toBeInstanceOf(
        ServerError,
      );
    });
  });

  describe('getSelfLearnerCourseFileById', () => {
    let fixtures: GetByIdFixtures;

    beforeEach(() => {
      fixtures = new GetByIdFixtures();
    });

    it('returns mapped row when single succeeds', async () => {
      fixtures.whenSingleReturnsRow();

      const result = await fixtures.whenGetById();

      expect(result).toEqual(
        selfLearnerCourseFileMapper.toDomain(fixtures.row),
      );
      fixtures.thenGetByIdChainBuilt(fixtures.fileId);
    });

    it('throws ServerError when Supabase reports error', async () => {
      fixtures.whenSingleFails('no rows');

      await expect(fixtures.whenGetById()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('deleteSelfLearnerCourseFileById', () => {
    let fixtures: DeleteByIdFixtures;

    beforeEach(() => {
      fixtures = new DeleteByIdFixtures();
    });

    it('runs delete constrained by primary id', async () => {
      fixtures.whenDeleteSucceeds();

      await fixtures.whenDeleteById();

      expect(fixtures.fromMock).toHaveBeenCalledWith(
        'self_learner_course_files',
      );
      expect(fixtures.deleteMock).toHaveBeenCalledTimes(1);
      expect(fixtures.eqAfterDeleteMock).toHaveBeenCalledWith(
        'id',
        fixtures.fileId,
      );
    });

    it('throws ServerError when delete fails', async () => {
      fixtures.whenDeleteFails('rls');

      await expect(fixtures.whenDeleteById()).rejects.toBeInstanceOf(
        ServerError,
      );
    });
  });
});

class UploadFixtures {
  public readonly payload = {
    courseId: 'c-1',
    fileUrl: 'self-learner/c-1/doc.pdf',
    fileName: 'doc.pdf',
  };

  public readonly supabaseRow = {
    id: 'scf-1',
    course_id: this.payload.courseId,
    file_url: this.payload.fileUrl,
    file_name: this.payload.fileName,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly fromMock = jest.fn();
  public readonly insertMock = jest.fn();
  public readonly selectAfterInsertMock = jest.fn();
  public readonly singleAfterInsertMock = jest.fn();

  public readonly repository: SelfLearnerCourseFileRepository;

  constructor() {
    this.repository = new SelfLearnerCourseFileRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenUpload() {
    return this.repository.uploadSelfLearnerCourseFile(this.payload);
  }

  whenInsertSucceeds() {
    this.singleAfterInsertMock.mockResolvedValue({
      data: this.supabaseRow,
      error: null,
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterInsertMock,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }

  whenInsertFails(message: string) {
    this.singleAfterInsertMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterInsertMock,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }
}

class ListFixtures {
  public readonly courseId = 'c-list-1';

  public readonly rows = [
    {
      id: 'f-2',
      course_id: this.courseId,
      file_url: 'a/b.pdf',
      file_name: 'b.pdf',
      created_at: '2026-01-03T12:00:00.000Z',
    },
    {
      id: 'f-1',
      course_id: this.courseId,
      file_url: 'a/c.pdf',
      file_name: 'c.pdf',
      created_at: '2026-01-02T12:00:00.000Z',
    },
  ];

  public readonly fromMock = jest.fn();
  public readonly selectMock = jest.fn();
  public readonly eqMock = jest.fn();
  public readonly orderMock = jest.fn();

  public readonly repository: SelfLearnerCourseFileRepository;

  constructor() {
    this.repository = new SelfLearnerCourseFileRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenList() {
    return this.repository.getSelfLearnerCourseFiles(this.courseId);
  }

  whenListSucceedsWithRows(rows: typeof this.rows) {
    this.orderMock.mockResolvedValue({
      data: rows,
      error: null,
    });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenListReturnsNull() {
    this.orderMock.mockResolvedValue({ data: null, error: null });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenListFails(message: string) {
    this.orderMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  thenListChainBuilt(courseId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('self_learner_course_files');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('course_id', courseId);
    expect(this.orderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  }
}

class UrlsFixtures {
  public readonly courseId = 'c-urls-1';

  public readonly fromMock = jest.fn();
  public readonly selectMock = jest.fn();
  public readonly eqMock = jest.fn();

  public readonly repository: SelfLearnerCourseFileRepository;

  constructor() {
    this.repository = new SelfLearnerCourseFileRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenGetUrls() {
    return this.repository.getSelfLearnerCourseFilesUrls(this.courseId);
  }

  whenUrlsQuerySucceeds(rows: { file_url: string }[]) {
    this.eqMock.mockResolvedValue({ data: rows, error: null });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenUrlsReturnsNullData() {
    this.eqMock.mockResolvedValue({ data: null, error: null });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenUrlsFails(message: string) {
    this.eqMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }
}

class DeleteFilesFixtures {
  public readonly courseId = 'c-del-files';

  public readonly fromMock = jest.fn();
  public readonly deleteMock = jest.fn();
  public readonly eqAfterDeleteMock = jest.fn();

  public readonly repository: SelfLearnerCourseFileRepository;

  constructor() {
    this.repository = new SelfLearnerCourseFileRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenDeleteFiles() {
    return this.repository.deleteSelfLearnerCourseFilesByCourseId(
      this.courseId,
    );
  }

  whenDeleteSucceeds() {
    this.eqAfterDeleteMock.mockResolvedValue({ error: null });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }

  whenDeleteFails(message: string) {
    this.eqAfterDeleteMock.mockResolvedValue({
      error: { message },
    });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }
}

class GetByIdFixtures {
  public readonly fileId = 'file-by-id';

  public readonly row = {
    id: this.fileId,
    course_id: 'c-own',
    file_url: 'self-learner/c-own/x.pdf',
    file_name: 'x.pdf',
    created_at: '2026-01-07T12:00:00.000Z',
  };

  public readonly fromMock = jest.fn();
  public readonly selectMock = jest.fn();
  public readonly eqMock = jest.fn();
  public readonly singleMock = jest.fn();

  public readonly repository: SelfLearnerCourseFileRepository;

  constructor() {
    this.repository = new SelfLearnerCourseFileRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenGetById() {
    return this.repository.getSelfLearnerCourseFileById(this.fileId);
  }

  whenSingleReturnsRow() {
    this.singleMock.mockResolvedValue({
      data: this.row,
      error: null,
    });
    this.eqMock.mockReturnValue({ single: this.singleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenSingleFails(message: string) {
    this.singleMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.eqMock.mockReturnValue({ single: this.singleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  thenGetByIdChainBuilt(fileId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('self_learner_course_files');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('id', fileId);
    expect(this.singleMock).toHaveBeenCalledTimes(1);
  }
}

class DeleteByIdFixtures {
  public readonly fileId = 'file-del-single';

  public readonly fromMock = jest.fn();
  public readonly deleteMock = jest.fn();
  public readonly eqAfterDeleteMock = jest.fn();

  public readonly repository: SelfLearnerCourseFileRepository;

  constructor() {
    this.repository = new SelfLearnerCourseFileRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenDeleteById() {
    return this.repository.deleteSelfLearnerCourseFileById(this.fileId);
  }

  whenDeleteSucceeds() {
    this.eqAfterDeleteMock.mockResolvedValue({ error: null });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }

  whenDeleteFails(message: string) {
    this.eqAfterDeleteMock.mockResolvedValue({
      error: { message },
    });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }
}
