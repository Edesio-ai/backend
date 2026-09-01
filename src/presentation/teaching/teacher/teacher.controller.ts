import { Body, Controller, Delete, Get, Param, Post, UseFilters } from '@nestjs/common';

import { GetTeacherByUserIdUseCase } from 'src/application/teaching/teacher/get-teacher-by-user-id.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { CreateTeacherBodyDto } from 'src/presentation/teaching/teacher/dtos/create-teacher-body.dto';
import { CreateTeacherUseCase } from 'src/application/teaching/teacher/create-teacher.use-case';
import { Teacher } from 'src/domain/teaching/teacher/types/teacher.type';
import { GlobalErrorFilter } from 'src/presentation/filters/global.filter';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { DeleteTeacherUseCase } from 'src/application/teaching/teacher/delete-teacher.use-case';

@Roles('teacher')
@Controller('teacher')
export class TeacherController {
  constructor(
    private readonly getTeacherByUserIdUseCase: GetTeacherByUserIdUseCase,
    private readonly createTeacherUseCase: CreateTeacherUseCase,
    private readonly deleteTeacherUseCase: DeleteTeacherUseCase,
  ) {}

  @Get()
  @UseFilters(GlobalErrorFilter)
  async getTeacherByUserId(@CurrentUser() user: AuthUser): Promise<{ teacher: Teacher | null }> {
    const teacher = await this.getTeacherByUserIdUseCase.execute(user.id);
    return { teacher };
  }

  @Post()
  @UseFilters(GlobalErrorFilter)
  async createTeacher(@CurrentUser() user: AuthUser, @Body() body: CreateTeacherBodyDto): Promise<Teacher | null> {
    const { id } = user;

    return this.createTeacherUseCase.execute(id, body);
  }

  @Roles('establishment')
  @Delete(':id')
  @UseFilters(GlobalErrorFilter)
  async deleteTeacher(@Param('id') id: string): Promise<void> {
    return this.deleteTeacherUseCase.execute(id);
  }
}
