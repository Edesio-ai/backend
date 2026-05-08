import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GetTeacherByUserIdUseCase } from 'src/application/teacher/get-teacher-by-user-id.use-case';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { SupabaseUser } from 'src/domain/auth/types/auth.type';
import { CreateTeacherBodyDto } from 'src/presentation/teaching/teacher/dtos/create-teacher-body.dto';
import { CreateTeacherUseCase } from 'src/application/teacher/create-teacher.use-case';
import { Teacher } from 'src/domain/teaching/types/teacher.type';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { GlobalErrorFilter } from 'src/presentation/filters/global';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('teacher')
@Controller('teacher')
export class TeacherController {
  constructor(
    private readonly getTeacherByUserIdUseCase: GetTeacherByUserIdUseCase,
    private readonly createTeacherUseCase: CreateTeacherUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @UseFilters(GlobalErrorFilter)
  async getTeacherByUserId(
    @Req() req: Request & { user: SupabaseUser },
  ): Promise<any> {
    const { user } = req;
    const teacher = await this.getTeacherByUserIdUseCase.execute(user.id);
    return { teacher };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @UseFilters(GlobalErrorFilter)
  async createTeacher(
    @Req() req: Request & { user: SupabaseUser },
    @Body() body: CreateTeacherBodyDto,
  ): Promise<Teacher | null> {
    const { user } = req;
    const { id } = user;

    return this.createTeacherUseCase.execute(id, body);
  }
}
