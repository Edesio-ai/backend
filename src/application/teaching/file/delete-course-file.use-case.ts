import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_REPOSITORY,
  type FileRepository,
} from 'src/domain/teaching/interface/file.repository';

@Injectable()
export class DeleteCourseFileUseCase {
  constructor(
    @Inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(fileId: string): Promise<void> {
    await this.fileRepository.deleteFileById(fileId);
  }
}
