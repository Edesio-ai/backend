import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';

import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { GetTeacherSessionsUseCase } from 'src/application/teacher/get-teacher-sessions.use-case';
import { AuthUser, SupabaseUser } from 'src/domain/auth/types/auth.type';
import { Session } from 'src/domain/teaching/types/session.type';
import { CreateSessionUseCase } from 'src/application/session/create-session.use-case';
import { UpdateSessionNameUseCase } from 'src/application/session/update-session-name.use-case';
import { GetSessionByCodeUseCase } from 'src/application/session/get-session-by-code.use-case';
import { DeleteSessionUseCase } from 'src/application/session/delete-session.use-case';
import { CreateSessionBodyDto } from './dtos/create-session.dto';
import { UpdateSessionBodyDto } from './dtos/uppdate-session-body.dto';
import { SessionDetails } from 'src/domain/teaching/types/course.type';
import { GetSessionDetailsUseCase } from 'src/application/session/get-session-details.use-case';

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
    @Req() req: Request & { user: SupabaseUser },
    @Param('sessionId') sessionId: string,
  ) {
    const { user } = req;
    const { id } = user;
    await this.deleteSessionUseCase.execute(sessionId, id);
    return { success: true };
  }

  @Post()
  async createSession(@Body() body: CreateSessionBodyDto): Promise<Session> {
    return await this.createSessionUseCase.execute(body);
  }

  @Get('teacher-sessions')
  async getTeacherSessions(
    @Req() req: Request & { user: SupabaseUser },
  ): Promise<Session[]> {
    const { user } = req;
    const { id } = user;

    return await this.getTeacherSessionsUseCase.execute(id);
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
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ data: SessionDetails }> {
    const { user } = req;
    const courseDetail = await this.getSessionDetailsUseCase.execute(
      courseId,
      user,
    );
    return { data: courseDetail };
  }
}
