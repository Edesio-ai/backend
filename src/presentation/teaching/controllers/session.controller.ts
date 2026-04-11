import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { GetTeacherSessionsUseCase } from 'src/application/teacher/get-teacher-sessions.use-case';
import { User } from 'src/domain/auth/types/auth.type';
import { Session } from 'src/domain/teaching/types/session.type';
import { CreateSessionUseCase } from 'src/application/session/create-session.use-case';
import { UpdateSessionNameUseCase } from 'src/application/session/update-session-name.use-case';
import { GetSessionByCodeUseCase } from 'src/application/session/get-session-by-code.use-case';
import { DeleteSessionUseCase } from 'src/application/session/delete-session.use-case';
import { GetCoursesSessionCountUseCase } from 'src/application/session/get-courses-session-count.use-case';
import { CreateSessionBodyDto } from '../dto/session/create-session.dto';
import { UpdateSessionBodyDto } from '../dto/session/uppdate-session-body.dto';

@Controller('session')
export class SessionController {
  constructor(
    private readonly getTeacherSessionsUseCase: GetTeacherSessionsUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly updateSessionNameUseCase: UpdateSessionNameUseCase,
    private readonly getSessionByCodeUseCase: GetSessionByCodeUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
    private readonly getCoursesSessionCountUseCase: GetCoursesSessionCountUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles('teacher')
  @Delete(':sessionId')
  async deleteSession(
    @Req() req: Request & { user: User },
    @Param('sessionId') sessionId: string,
  ) {
    const { user } = req;
    const { id } = user;
    await this.deleteSessionUseCase.execute(sessionId, id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('teacher')
  @Post()
  async createSession(@Body() body: CreateSessionBodyDto): Promise<Session> {
    return await this.createSessionUseCase.execute(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('teacher-sessions')
  async getTeacherSessions(
    @Req() req: Request & { user: User },
  ): Promise<Session[]> {
    const { user } = req;
    const { id } = user;

    return await this.getTeacherSessionsUseCase.execute(id);
  }

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('teacher')
  @Put(':sessionId')
  async updateSessionName(
    @Param('sessionId') sessionId: string,
    @Body() body: UpdateSessionBodyDto,
  ): Promise<{ session: Session }> {
    const session = await this.updateSessionNameUseCase.execute(
      sessionId,
      body,
    );
    return { session };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('code/:code')
  async getSessionByCode(
    @Param('code') code: string,
  ): Promise<{ session: Session }> {
    const session = await this.getSessionByCodeUseCase.execute(code);
    return {
      session,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('/:sessionId/courses-count')
  async getCoursesSessionCount(
    @Param('sessionId') sessionId: string,
  ): Promise<{ count: number }> {
    const count = await this.getCoursesSessionCountUseCase.execute(sessionId);
    return { count: count };
  }
}
