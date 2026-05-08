import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Course } from 'src/domain/teaching/types/course.type';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { Roles } from '../../auth/decorator/role.decorator';
import { CreateCourseUseCase } from 'src/application/course/create-course.use-case';
import { CreateCourseBodyDto } from './dto/create-course-body.dto';
import { GetCourseValidatedQuestionsUseCase } from 'src/application/course/get-course-validated-questions.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { GlobalErrorFilter } from 'src/presentation/filters/global';
import { DeleteCourseUseCase } from 'src/application/course/delete-course.use-case';
import { UpdateCourseBodyDto } from './dto/UpdateCourseUseCase.dto';
import { UpdateCourseUseCase } from 'src/application/course/update-course.use-case';
import { ValidateCourseQuestionsUseCase } from 'src/application/course/validate-course-questions.use-case';
import { GetCoursesSessionCountUseCase } from 'src/application/course/get-courses-session-count.use-case';
import { GetSessionCoursesUseCase } from 'src/application/session/get-session-courses.use-case';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@UseFilters(GlobalErrorFilter)
@Roles('teacher')
@Controller('course')
export class CourseController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly getCourseValidatedQuestionsUseCase: GetCourseValidatedQuestionsUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly validateCourseQuestionsUseCase: ValidateCourseQuestionsUseCase,
    private readonly getCoursesSessionCountUseCase: GetCoursesSessionCountUseCase,
    private readonly getSessionCoursesUseCase: GetSessionCoursesUseCase,
  ) {}

  @Post()
  async createCourse(
    @Body() body: CreateCourseBodyDto,
  ): Promise<{ data: Course }> {
    const data = await this.createCourseUseCase.execute(body);
    return { data };
  }

  @Get(':courseId/validated-questions')
  async getCourseValidatedQuestions(
    @Param('courseId') courseId: string,
  ): Promise<{ validatedQuestions: boolean | null }> {
    return await this.getCourseValidatedQuestionsUseCase.execute(courseId);
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

  @Get('session/:sessionId/count')
  async getCoursesSessionCount(
    @Param('sessionId') sessionId: string,
  ): Promise<{ count: number }> {
    const count = await this.getCoursesSessionCountUseCase.execute(sessionId);
    return { count: count };
  }

  @Roles('teacher', 'establishment', 'student')
  @Get('session/:sessionId')
  async getCoursesBySessionId(
    @Param('sessionId') sessionId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<Course[]> {
    const { user } = req;
    return (await this.getSessionCoursesUseCase.execute(sessionId, user)) || [];
  }
}
