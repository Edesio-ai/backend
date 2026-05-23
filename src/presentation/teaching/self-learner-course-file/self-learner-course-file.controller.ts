import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import { CourseFileUpload } from 'src/domain/teaching/course-file/types/course-file.type';
import { UploadSelfLearnerCourseFileUseCase } from 'src/application/teaching/self-learner-course-file/upload-self-learner-course-file.use-case';
import { SelfLearnerCourseFile } from 'src/domain/teaching/self-learner-course-file/types/self-learner-course-file.type';

@Controller('self-learner-course-file')
export class SelfLearnerCourseFileController {
  constructor(
    private readonly uploadSelfLearnerCourseFileUseCase: UploadSelfLearnerCourseFileUseCase,
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('self-learner-course/:courseId')
  async uploadSelfLearnerCourseFile(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ data: SelfLearnerCourseFile }> {
    if (!file?.buffer) {
      throw new BadRequestError('Missing File');
    }

    const payload: CourseFileUpload = {
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      byteLength: file.size,
    };

    const data = await this.uploadSelfLearnerCourseFileUseCase.execute(
      courseId,
      payload,
    );

    return { data };
  }
}
