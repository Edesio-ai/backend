export const FILE_REPOSITORY = Symbol('FILE_REPOSITORY');

export interface FileRepository {
  deleteFileById(fileId: string): Promise<void>;
}
