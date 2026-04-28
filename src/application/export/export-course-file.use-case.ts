import { Inject, NotFoundException } from '@nestjs/common';
import {
  PDF_EXTRACTOR,
  type PdfExtractor,
} from 'src/domain/pdf/contracts/pdf-extractor.interface';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import {
  FILE_REPOSITORY,
  type FileRepository,
} from 'src/domain/teaching/interface/file.repository';

export class ExportCourseFileUseCase {
  constructor(
    @Inject(PDF_EXTRACTOR)
    private readonly pdfExtractor: PdfExtractor,
    @Inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(fileId: string): Promise<{ buffer: Buffer; fileName: string }> {
    const file = await this.fileRepository.getCourseFileById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const buffer = await this.courseRepository.getFileBufferFromStorage(
      file.fileUrl,
    );
    if (!buffer) {
      throw new NotFoundException('File not found');
    }
    return { buffer, fileName: file.fileName };
  }
}
