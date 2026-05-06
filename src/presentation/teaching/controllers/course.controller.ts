import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  CourseDetails,
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
import { DeleteCourseUseCase } from 'src/application/course/delete-course.use-case';
import { UpdateCourseBodyDto } from '../dto/course/UpdateCourseUseCase.dto';
import { UpdateCourseUseCase } from 'src/application/course/update-course.use-case';
import { ValidateCourseQuestionsUseCase } from 'src/application/course/validate-course-questions.use-case';
import { GetCourseDetailsUseCase } from 'src/application/course/get-course-details.use-case';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@UseFilters(GlobalErrorFilter)
@Roles('teacher')
@Controller('course')
export class CourseController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly uploadCourseFileUseCase: UploadCourseFileUseCase,
    private readonly getCourseValidatedQuestionsUseCase: GetCourseValidatedQuestionsUseCase,
    private readonly getCoursesFilesUseCase: GetCourseFilesUseCase,
    private readonly getCourseRankingUseCase: GetCourseRankingUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly validateCourseQuestionsUseCase: ValidateCourseQuestionsUseCase,
    private readonly getCourseDetailsUseCase: GetCourseDetailsUseCase,
  ) {}

  @Post()
  async createCourse(
    @Body() body: CreateCourseBodyDto,
  ): Promise<{ data: Course }> {
    const data = await this.createCourseUseCase.execute(body);
    return { data };
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':courseId/file')
  async uploadCourseFile(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ data: CourseFile }> {
    if (!file?.buffer) {
      throw new BadRequestException('Missing File');
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

  @Get(':courseId/validated-questions')
  async getCourseValidatedQuestions(
    @Param('courseId') courseId: string,
  ): Promise<{ validatedQuestions: boolean | null }> {
    return await this.getCourseValidatedQuestionsUseCase.execute(courseId);
  }

  @Get(':courseId/files')
  async getCoursesFiles(
    @Param('courseId') courseId: string,
  ): Promise<CourseFile[]> {
    return (await this.getCoursesFilesUseCase.execute(courseId)) || [];
  }

  @UseFilters(GlobalErrorFilter)
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

  @Delete(':courseId')
  async deleteCourse(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ success: boolean }> {
    const { user } = req;
    await this.deleteCourseUseCase.execute(courseId, user);

    return { success: true };
  }

  @Patch(':courseId')
  async deleteCourseFiles(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
    @Body() body: UpdateCourseBodyDto,
  ): Promise<{ data: Course }> {
    const { user } = req;
    const course = await this.updateCourseUseCase.execute(courseId, body, user);

    return { data: course };
  }

  @Post(':courseId/validate-questions')
  async validateQuestions(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ data: Course }> {
    const { user } = req;
    const course = await this.validateCourseQuestionsUseCase.execute(
      courseId,
      user,
    );

    return { data: course };
  }

  @Roles('establishment')
  @Get(':courseId/details')
  async getCourseDetails(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ data: CourseDetails }> {
    const { user } = req;
    const courseDetail = await this.getCourseDetailsUseCase.execute(
      courseId,
      user,
    );
    return { data: courseDetail };
  }
}
