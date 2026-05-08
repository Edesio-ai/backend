import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';

import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { Session } from 'src/domain/teaching/types/session.type';
import { CreateSessionUseCase } from 'src/application/teaching/session/create-session.use-case';
import { UpdateSessionNameUseCase } from 'src/application/teaching/session/update-session-name.use-case';
import { GetSessionByCodeUseCase } from 'src/application/teaching/session/get-session-by-code.use-case';
import { DeleteSessionUseCase } from 'src/application/teaching/session/delete-session.use-case';
import { CreateSessionBodyDto } from './dtos/create-session.dto';
import { UpdateSessionBodyDto } from './dtos/uppdate-session-body.dto';
import { SessionDetails } from 'src/domain/teaching/types/course.type';
import { GetSessionDetailsUseCase } from 'src/application/teaching/session/get-session-details.use-case';
import { GetTeacherSessionsUseCase } from 'src/application/teaching/session/get-teacher-sessions.use-case';

@Roles('teacher')
@Controller('session')
export class SessionController {
  constructor(
    private readonly getTeacherSessionsUseCase: GetTeacherSessionsUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly updateSessionNameUseCase: UpdateSessionNameUseCase,
    private readonly getSessionByCodeUseCase: GetSessionByCodeUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
    private readonly getSessionDetailsUseCase: GetSessionDetailsUseCase,
  ) {}

  @Delete(':sessionId')
  async deleteSession(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
  ) {
    await this.deleteSessionUseCase.execute(sessionId, user.id);
    return { success: true };
  }

  @Post()
  async createSession(@Body() body: CreateSessionBodyDto): Promise<Session> {
    return await this.createSessionUseCase.execute(body);
  }

  @Get('teacher-sessions')
  async getTeacherSessions(@CurrentUser() user: AuthUser): Promise<Session[]> {
    return await this.getTeacherSessionsUseCase.execute(user.id);
  }

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

  @Get('code/:code')
  async getSessionByCode(
    @Param('code') code: string,
  ): Promise<{ session: Session | null }> {
    const session = await this.getSessionByCodeUseCase.execute(code);
    return {
      session,
    };
  }

  @Roles('establishment')
  @Get('course/:courseId/details')
  async getSessionDetails(
    @Param('courseId') courseId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: SessionDetails }> {
    const courseDetail = await this.getSessionDetailsUseCase.execute(
      courseId,
      user,
    );
    return { data: courseDetail };
  }
}
