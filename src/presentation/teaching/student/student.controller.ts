import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { GetStudentByUserIdUseCase } from 'src/application/teaching/student/get-student-by-user-id.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { CreateStudentUseCase } from 'src/application/teaching/student/create-student.use-case';
import {
  Student,
  StudentPhotoUpload,
} from 'src/domain/teaching/student/type/student.type';
import { GetStudentBatchBodyDto } from './dtos/get-student-batch.dto';
import { GetStudentBatchUseCase } from 'src/application/teaching/student/get-student-batch.use-case';
import { UploadStudentPhotoUseCase } from 'src/application/teaching/student/upload-student-photo.use-case';

@Controller('student')
@Roles('student')
export class StudentController {
  constructor(
    private readonly getStudentByUserIdUseCase: GetStudentByUserIdUseCase,
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly getStudentBatchUseCase: GetStudentBatchUseCase,
    private readonly uploadStudentPhotoUseCase: UploadStudentPhotoUseCase,
  ) {}

  @Get()
  async getStudentByUserId(@CurrentUser() user: AuthUser) {
    const student = await this.getStudentByUserIdUseCase.execute(user.id);
    return student;
  }

  @Post()
  async createStudent(@CurrentUser() user: AuthUser) {
    const student = await this.createStudentUseCase.execute(user);
    return student;
  }

  @Roles('establishment')
  @Post('batch')
  async getStudentBatch(
    @Body() body: GetStudentBatchBodyDto,
  ): Promise<Student[]> {
    const students = await this.getStudentBatchUseCase.execute(body);
    return students ?? [];
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('photo')
  async uploadStudentPhoto(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ photoUrl: string }> {
    if (!file?.buffer) {
      throw new BadRequestException('Missing File');
    }

    const payload: StudentPhotoUpload = {
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      byteLength: file.size,
    };

    const photoUrl = await this.uploadStudentPhotoUseCase.execute(
      user,
      payload,
    );
    return { photoUrl };
  }
}
