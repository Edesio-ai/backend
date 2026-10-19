import { Inject } from '@nestjs/common';
import { CourseFile, CourseFileUpload } from 'src/domain/teaching/course-file/types/course-file.type';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { MAX_COURSE_FILE_BYTES, MAX_COURSE_FILES } from 'src/domain/teaching/course-file/course-file.limits';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';

export class UploadCourseFileUseCase {
  constructor(
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(courseId: string, file: CourseFileUpload): Promise<CourseFile> {
    if (file.byteLength > MAX_COURSE_FILE_BYTES) {
      throw new BadRequestError('FILETOO_LARGE');
    }

    const courseFiles = await this.courseFileRepository.getCourseFilesByCourseId(courseId);

    if (courseFiles.length >= MAX_COURSE_FILES) {
      throw new BadRequestError('MAX_COURSE_FILES_REACHED');
    }

    const ext = file.originalFileName.split('.').pop() ?? 'bin';
    const storagePath = `${courseId}/${Date.now()}.${ext}`;
    await this.courseFileRepository.storeCourseFile(file, storagePath);

    return this.courseFileRepository.insertCourseFile(courseId, file, storagePath);
  }
}
