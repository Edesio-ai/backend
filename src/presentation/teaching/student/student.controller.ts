import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { GetStudentByUserIdUseCase } from 'src/application/student/get-student-by-user-id.use-case';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { CreateStudentUseCase } from 'src/application/student/create-student.use-case';
import {
  Student,
  StudentPhotoUpload,
} from 'src/domain/teaching/types/student.type';
import { GetStudentBatchBodyDto } from './dtos/get-student-batch.dto';
import { GetStudentBatchUseCase } from 'src/application/student/get-student-batch.use-case';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadStudentPhotoUseCase } from 'src/application/student/upload-student-photo.use-case';
import { GlobalErrorFilter } from 'src/presentation/filters/global';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('student')
@UseFilters(GlobalErrorFilter)
@Controller('student')
export class StudentController {
  constructor(
    private readonly getStudentByUserIdUseCase: GetStudentByUserIdUseCase,
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly getStudentBatchUseCase: GetStudentBatchUseCase,
    private readonly uploadStudentPhotoUseCase: UploadStudentPhotoUseCase,
  ) {}

  @Get()
  async getStudentByUserId(@Req() req: Request & { user: AuthUser }) {
    const { user } = req;
    const student = await this.getStudentByUserIdUseCase.execute(user.id);
    return student;
  }

  @Post()
  async createStudent(@Req() req: Request & { user: AuthUser }) {
    const { user } = req;
    const student = await this.createStudentUseCase.execute(user);
    return student;
  }

  @Roles('establishment')
  @Post('batch')
  async getStudentBatch(
    @Body() body: GetStudentBatchBodyDto,
    @Req() req: Request & { user: AuthUser },
  ): Promise<Student[]> {
    const students = await this.getStudentBatchUseCase.execute(body);
    return students ?? [];
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('photo')
  async uploadStudentPhoto(
    @Req() req: Request & { user: AuthUser },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ photoUrl: string }> {
    const { user } = req;

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
