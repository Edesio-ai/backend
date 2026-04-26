import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CourseFile,
  CourseFileUpload,
  Course,
  CourseRanking,
} from 'src/domain/teaching/types/course.type';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { Roles } from '../../auth/decorator/role.decorator';
import { CreateCourseUseCase } from 'src/application/course/create-course.use-case';
import { CreateCourseBodyDto } from '../dto/course/create-course-body.dto';
import { UploadCourseFileUseCase } from 'src/application/course/upload-course-file.use-case';
import { GetCourseValidatedQuestionsUseCase } from 'src/application/course/get-course-validated-questions';
import { GetCourseFilesUseCase } from 'src/application/course/get-course-files.use-case';
import { GetCourseRankingUseCase } from 'src/application/course/get-course-ranking.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { GlobalErrorFilter } from 'src/presentation/filters/shared.filter';
import { TeacherErrorFilter } from 'src/presentation/filters/teacher.filter';
import { DeleteCourseUseCase } from 'src/application/course/delete-course.use-case';

@Controller('course')
export class CourseController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly uploadCourseFileUseCase: UploadCourseFileUseCase,
    private readonly getCourseValidatedQuestionsUseCase: GetCourseValidatedQuestionsUseCase,
    private readonly getCoursesFilesUseCase: GetCourseFilesUseCase,
    private readonly getCourseRankingUseCase: GetCourseRankingUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get(':courseId/validated-questions')
  async getCourseValidatedQuestions(
    @Param('courseId') courseId: string,
  ): Promise<{ validatedQuestions: boolean | null }> {
    return await this.getCourseValidatedQuestionsUseCase.execute(courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get(':courseId/files')
  async getCoursesFiles(
    @Param('courseId') courseId: string,
  ): Promise<CourseFile[]> {
    return (await this.getCoursesFilesUseCase.execute(courseId)) || [];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(TeacherErrorFilter, GlobalErrorFilter)
  @Roles('teacher')
  @Get('/:courseId/ranking')
  async getCourseRanking(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<CourseRanking[]> {
    const { user } = req;
    const ranking =
      (await this.getCourseRankingUseCase.execute(courseId, user)) || [];
    return ranking || [];
  }

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('teacher')
  @UseFilters(GlobalErrorFilter)
  @Delete(':courseId')
  async deleteCourse(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ success: boolean }> {
    const { user } = req;
    await this.deleteCourseUseCase.execute(courseId, user);

    return { success: true };
  }
}
