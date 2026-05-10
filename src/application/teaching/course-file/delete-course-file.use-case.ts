import { Inject, Injectable } from '@nestjs/common';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';

@Injectable()
export class DeleteCourseFileUseCase {
  constructor(
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
  ) {}

  async execute(fileId: string): Promise<void> {
    await this.courseFileRepository.deleteFileById(fileId);
  }
}
