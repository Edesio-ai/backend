import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { GetCourseRankingUseCase } from 'src/application/course/get-course-ranking.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { CourseRanking } from 'src/domain/teaching/types/course.type';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { UpdateOrCreateStudentCourseStatsBodyDto } from './dtos/update-or-create-student-course-stats.dto';
import { UpdateOrCreateStudentCourseStatsUseCase } from 'src/application/student/update-or-create-student-course-stats.use-case';

@Controller('student-course-stats')
@Roles('teacher')
export class StudentCourseStatsController {
  constructor(
    private readonly getCourseRankingUseCase: GetCourseRankingUseCase,
    private readonly updateOrCreateStudentCourseStatsUseCase: UpdateOrCreateStudentCourseStatsUseCase,
  ) {}

  @Get('course/:courseId/ranking')
  async getCourseRanking(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<CourseRanking[]> {
    const { user } = req;
    const ranking =
      (await this.getCourseRankingUseCase.execute(courseId, user)) || [];
    return ranking || [];
  }

  @Roles('student')
  @Post('course/:courseId')
  async updateOrCreateStudentCourseStats(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
    @Body() body: UpdateOrCreateStudentCourseStatsBodyDto,
  ): Promise<void> {
    const { user } = req;

    await this.updateOrCreateStudentCourseStatsUseCase.execute(
      courseId,
      user,
      body,
    );
  }
}
