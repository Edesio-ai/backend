import {
  Controller,
  Get,
  Param,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GetCourseRankingUseCase } from 'src/application/course/get-course-ranking.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { CourseRanking } from 'src/domain/teaching/types/course.type';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { GlobalErrorFilter } from 'src/presentation/filters/global';

@UseFilters(GlobalErrorFilter)
@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('teacher')
@Controller('student-course-stats')
export class StudentCourseStatsController {
  constructor(
    private readonly getCourseRankingUseCase: GetCourseRankingUseCase,
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
}
