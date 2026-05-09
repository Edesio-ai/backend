import { Inject, NotFoundException } from '@nestjs/common';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/interfaces/i-course-file.repository';

export class ExportCourseFileUseCase {
  constructor(
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(fileId: string): Promise<{ buffer: Buffer; fileName: string }> {
    const file = await this.courseFileRepository.getCourseFileById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const buffer = await this.courseFileRepository.getFileBufferFromStorage(
      file.fileUrl,
    );
    if (!buffer) {
      throw new NotFoundException('File not found');
    }
    return { buffer, fileName: file.fileName };
  }
}
