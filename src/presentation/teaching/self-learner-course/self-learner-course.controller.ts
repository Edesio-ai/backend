import { Controller, Get } from '@nestjs/common';
import { GetSelfLearnerCoursesUseCase } from 'src/application/teaching/self-learner-course/get-self-learner-courses.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { SelfLearnerCourse } from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';

@Roles('self-learner')
@Controller('self-learner-course')
export class SelfLearnerCourseController {
  constructor(
    private readonly getSelfLearnerCoursesUseCase: GetSelfLearnerCoursesUseCase,
  ) {}

  @Get()
  async getSelfLearnerCourse(
    @CurrentUser() user: AuthUser,
  ): Promise<SelfLearnerCourse[]> {
    return this.getSelfLearnerCoursesUseCase.execute(user);
  }
}
