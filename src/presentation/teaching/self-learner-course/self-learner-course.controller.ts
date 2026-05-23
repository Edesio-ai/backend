import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GetSelfLearnerCoursesUseCase } from 'src/application/teaching/self-learner-course/get-self-learner-courses.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { SelfLearnerCourse } from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';
import { GetSelfLearnerCoursesCountUseCase } from 'src/application/teaching/self-learner-course/get-self-learner-courses-count.use-case';
import { CreateSelfLearnerCourseBodyDto } from './dtos/create-self-learner-course-body.dto';
import { CreateSelfLearnerCourseUseCase } from 'src/application/teaching/self-learner-course/create-self-learner-course.use-case';
import { UpdateSelfLearnerCourseBodyDto } from './dtos/update-self-learner-course-body.dto';
import { UpdateSelfLearnerCourseUseCase } from 'src/application/teaching/self-learner-course/update-self-learner-course.use-case';

@Roles('self-learner')
@Controller('self-learner-course')
export class SelfLearnerCourseController {
  constructor(
    private readonly getSelfLearnerCoursesUseCase: GetSelfLearnerCoursesUseCase,
    private readonly getSelfLearnerCoursesCountUseCase: GetSelfLearnerCoursesCountUseCase,
    private readonly createSelfLearnerCourseUseCase: CreateSelfLearnerCourseUseCase,
    private readonly updateSelfLearnerCourseUseCase: UpdateSelfLearnerCourseUseCase,
  ) {}

  @Get()
  async getSelfLearnerCourse(
    @CurrentUser() user: AuthUser,
  ): Promise<SelfLearnerCourse[]> {
    return this.getSelfLearnerCoursesUseCase.execute(user);
  }

  @Get('count')
  async getSelfLearnerCourseCount(
    @CurrentUser() user: AuthUser,
  ): Promise<{ count: number }> {
    return await this.getSelfLearnerCoursesCountUseCase.execute(user);
  }

  @Post()
  async createSelfLearnerCourse(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateSelfLearnerCourseBodyDto,
  ): Promise<SelfLearnerCourse> {
    return await this.createSelfLearnerCourseUseCase.execute(user, body);
  }

  @Patch(':courseId')
  async updateSelfLearnerCourse(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
    @Body() body: UpdateSelfLearnerCourseBodyDto,
  ): Promise<SelfLearnerCourse> {
    return await this.updateSelfLearnerCourseUseCase.execute(
      user.id,
      courseId,
      body,
    );
  }
}
