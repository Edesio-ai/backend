import { Inject, NotFoundException } from '@nestjs/common';
import {
  PDF_EXTRACTOR,
  type PdfExtractor,
} from 'src/domain/pdf/contracts/pdf-extractor.interface';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import {
  FILE_REPOSITORY,
  type FileRepository,
} from 'src/domain/teaching/interfaces/file.repository';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/interfaces/i-course-file.repository';

export class ExportCourseFileUseCase {
  constructor(
    @Inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(fileId: string): Promise<{ buffer: Buffer; fileName: string }> {
    const file = await this.fileRepository.getCourseFileById(fileId);
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
