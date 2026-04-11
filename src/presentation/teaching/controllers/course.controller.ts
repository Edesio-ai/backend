import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Course,
  CourseFile,
  CourseFileUpload,
} from 'src/domain/teaching/course.type';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { Roles } from '../../auth/decorator/role.decorator';
import { CreateCourseUseCase } from 'src/application/course/create-course.use-case';
import { CreateCourseBodyDto } from '../dto/course/create-course-body.dto';
import { UploadCourseFileUseCase } from 'src/application/course/upload-course-file.use-case';

@Controller('course')
export class CourseController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly uploadCourseFileUseCase: UploadCourseFileUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('teacher')
  @Post()
  async createCourse(
    @Body() body: CreateCourseBodyDto,
  ): Promise<{ data: Course }> {
    const data = await this.createCourseUseCase.execute(body);
    return { data };
  }

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('teacher')
  @UseInterceptors(FileInterceptor('file'))
  @Post(':courseId/file')
  async uploadCourseFile(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ coursesCount: CourseFile }> {
    if (!file?.buffer) {
      throw new BadRequestException('Missing File');
    }

    const payload: CourseFileUpload = {
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      byteLength: file.size,
    };

    const coursesCount = await this.uploadCourseFileUseCase.execute(
      courseId,
      payload,
    );

    return { coursesCount };
  }
}
