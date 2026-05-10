import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DeleteCourseFileUseCase } from 'src/application/teaching/course-file/delete-course-file.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import {
  CourseFile,
  CourseFileUpload,
} from 'src/domain/teaching/course-file/types/course-file.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import { UploadCourseFileUseCase } from 'src/application/teaching/course-file/upload-course-file.use-case';
import { GetCourseFilesUseCase } from 'src/application/teaching/course-file/get-course-files.use-case';

@Roles('teacher')
@Controller('course-file')
export class CourseFileController {
  constructor(
    private readonly deleteCourseFileUseCase: DeleteCourseFileUseCase,
    private readonly uploadCourseFileUseCase: UploadCourseFileUseCase,
    private readonly getCoursesFilesUseCase: GetCourseFilesUseCase,
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('course/:courseId')
  async uploadCourseFile(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ data: CourseFile }> {
    if (!file?.buffer) {
      throw new BadRequestError('Missing File');
    }

    const payload: CourseFileUpload = {
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      byteLength: file.size,
    };

    const data = await this.uploadCourseFileUseCase.execute(courseId, payload);

    return { data };
  }

  @Delete(':fileId')
  async deleteCourseFile(
    @Param('fileId') fileId: string,
  ): Promise<{ success: boolean }> {
    await this.deleteCourseFileUseCase.execute(fileId);
    return { success: true };
  }

  @Get('course/:courseId')
  async getCoursesFiles(
    @Param('courseId') courseId: string,
  ): Promise<CourseFile[]> {
    return (await this.getCoursesFilesUseCase.execute(courseId)) || [];
  }
}
