import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorator/role.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CsrfGuard } from "../auth/guards/csrf.guard";
import { GetTeacherSessionsUseCase } from "src/application/teacher/get-teacher-sessions.use-case";
import { User } from "src/domain/auth/auth.type";
import { Session } from "src/domain/teaching/session.type";
import { CreateSessionBodyDto } from "../teacher/dto/create-session.dto";
import { CreateSessionUseCase } from "src/application/teacher/create-session.use-case";
import { UpdateSessionBodyDto } from "../teacher/dto/uppdate-session-body.dto";
import { UpdateSessionNameUseCase } from "src/application/teacher/update-session-name.use-case";
import { GetSessionByCodeUseCase } from "src/application/teacher/get-session-by-code.use-case";

@Controller('session')
export class SessionController {
    constructor(
        private readonly getTeacherSessionsUseCase: GetTeacherSessionsUseCase,
        private readonly createSessionUseCase: CreateSessionUseCase,
        private readonly updateSessionNameUseCase: UpdateSessionNameUseCase,
        private readonly getSessionByCodeUseCase: GetSessionByCodeUseCase,

    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
    @Roles('teacher')
    @Delete(":sessionId")
    async deleteSession(
        @Param("sessionId") sessionId: string
    ) {
        console.log('oin', sessionId);
        return;
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
}