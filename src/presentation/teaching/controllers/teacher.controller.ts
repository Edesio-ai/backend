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
import { TokenErrorFilter } from 'src/presentation/filters/token.filter';
import { User } from 'src/domain/auth/auth.type';
import { CreateTeacherBodyDto } from 'src/presentation/teaching/dto/teacher/create-teacher-body.dto';
import { CreateTeacherUseCase } from 'src/application/teacher/create-teacher.use-case';
import { Teacher } from 'src/domain/teaching/teacher.type';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { ValidateTeacherInvitationBodyDto } from 'src/presentation/teaching/dto/teacher/validate-teacher-invitation-body.dto';
import { ValidateTeacherInvitationUseCase } from 'src/application/teacher/validate-teacher-invitation.use-case';
import { TeacherErrorFilter } from 'src/presentation/filters/teacher.filter';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';

@Controller('teacher')
export class TeacherController {
  constructor(
    private readonly getTeacherByUserIdUseCase: GetTeacherByUserIdUseCase,
    private readonly createTeacherUseCase: CreateTeacherUseCase,
    private readonly validateTeacherInvitationUseCase: ValidateTeacherInvitationUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get()
  @UseFilters(TokenErrorFilter)
  async getTeacherByUserId(@Req() req: Request & { user: User }): Promise<any> {
    const { user } = req;
    const teacher = await this.getTeacherByUserIdUseCase.execute(user.id);
    return { teacher };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Post()
  @UseFilters(TokenErrorFilter)
  async createTeacher(
    @Req() req: Request & { user: User },
    @Body() body: CreateTeacherBodyDto,
  ): Promise<Teacher | null> {
    const { user } = req;
    const { id } = user;

    return this.createTeacherUseCase.execute(id, body);
  }

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('teacher')
  @Post('validate-invitation')
  @UseFilters(TokenErrorFilter, TeacherErrorFilter)
  async validateTeacherInvitation(
    @Req() req: Request & { user: User },
    @Body() body: ValidateTeacherInvitationBodyDto,
  ): Promise<any> {
    const { user } = req;
    const { id } = user;
    const invitationToken = await this.validateTeacherInvitationUseCase.execute(
      id,
      body.token,
    );

    return {
      success: true,
      etablissementId: invitationToken?.establishment_id,
    };
  }
}
