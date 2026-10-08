export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');

export interface IProfileRepository {
  storeProfilePhoto(buffer: Buffer, storagePath: string): Promise<string>;
}
