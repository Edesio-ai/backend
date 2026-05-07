import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DeleteCourseFileUseCase } from 'src/application/course/delete-course-file.use-case';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { GlobalErrorFilter } from 'src/presentation/filters/global';
import {
  CourseFile,
  CourseFileUpload,
} from 'src/domain/teaching/types/course.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestError } from 'src/domain/shared/global/errors/global.errors';
import { UploadCourseFileUseCase } from 'src/application/course/upload-course-file.use-case';
import { GetCourseFilesUseCase } from 'src/application/course/get-course-files.use-case';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('teacher')
@Controller('file')
export class FileController {
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

  @UseFilters(GlobalErrorFilter)
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
