import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';

import { GetTeacherByUserIdUseCase } from 'src/application/teacher/get-teacher-by-user-id.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { CreateTeacherBodyDto } from 'src/presentation/teaching/teacher/dtos/create-teacher-body.dto';
import { CreateTeacherUseCase } from 'src/application/teacher/create-teacher.use-case';
import { Teacher } from 'src/domain/teaching/types/teacher.type';
import { GlobalErrorFilter } from 'src/presentation/filters/global.filter';
import type { AuthUser } from 'src/domain/auth/types/auth.type';

@Roles('teacher')
@Controller('teacher')
export class TeacherController {
  constructor(
    private readonly getTeacherByUserIdUseCase: GetTeacherByUserIdUseCase,
    private readonly createTeacherUseCase: CreateTeacherUseCase,
  ) {}

  @Get()
  @UseFilters(GlobalErrorFilter)
  async getTeacherByUserId(@CurrentUser() user: AuthUser): Promise<any> {
    const teacher = await this.getTeacherByUserIdUseCase.execute(user.id);
    return { teacher };
  }

  @Post()
  @UseFilters(GlobalErrorFilter)
  async createTeacher(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateTeacherBodyDto,
  ): Promise<Teacher | null> {
    const { id } = user;

    return this.createTeacherUseCase.execute(id, body);
  }
}
