import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  SessionStudentsPayload,
  StudentJoinedSession,
} from 'src/domain/teaching/student-session/types/student-session.type';
import { GetStudentJoinedSessionsUseCase } from 'src/application/teaching/student-session/get-student-joined-sessions.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { JoinSessionByCodeUseCase } from 'src/application/teaching/student-session/join-session-by-code.use-case';
import { GetSessionStudentUseCase } from 'src/application/teaching/student-session/get-session-student.use-case';
import { DeleteStudentSessionUseCase } from 'src/application/teaching/student-session/delete-student-session.use-case';
import { BanStudentFromSessionUseCase } from 'src/application/teaching/student-session/ban-student-from-session.use-case';
import { UnbanStudentFromSessionUseCase } from 'src/application/teaching/student-session/unban-student-from-session.use-case';

@Roles('student')
@Controller('student-session')
export class StudentSessionController {
  constructor(
    private readonly getStudentJoinedSessionsUseCase: GetStudentJoinedSessionsUseCase,
    private readonly joinSessionByCodeUseCase: JoinSessionByCodeUseCase,
    private readonly getSessionStudentUseCase: GetSessionStudentUseCase,
    private readonly deleteStudentSessionUseCase: DeleteStudentSessionUseCase,
    private readonly banStudentFromSessionUseCase: BanStudentFromSessionUseCase,
    private readonly unbanStudentFromSessionUseCase: UnbanStudentFromSessionUseCase,
  ) {}

  @Get('student/:studentId/joined-sessions')
  async getStudentJoinedSessions(@Param('studentId') studentId: string): Promise<StudentJoinedSession[]> {
    const student = await this.getStudentJoinedSessionsUseCase.execute(studentId);
    return student;
  }

  @Post('join-session/:code')
  async joinSessionByCode(@Param('code') code: string, @CurrentUser() user: AuthUser): Promise<void> {
    await this.joinSessionByCodeUseCase.execute(code, user.id);
  }

  @Roles('teacher', 'establishment')
  @Get('/session/:sessionId')
  async getStudentSessions(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<SessionStudentsPayload> {
    return this.getSessionStudentUseCase.execute(sessionId, user);
  }

  @Roles('teacher')
  @Post('/session/:sessionId/students/:studentId/ban')
  async banStudentFromSession(
    @Param('sessionId') sessionId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.banStudentFromSessionUseCase.execute(sessionId, studentId, user);
  }

  @Roles('teacher')
  @Post('/session/:sessionId/students/:studentId/unban')
  async unbanStudentFromSession(
    @Param('sessionId') sessionId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.unbanStudentFromSessionUseCase.execute(sessionId, studentId, user);
  }

  @Delete('session/:sessionId')
  async deleteStudentSession(@Param('sessionId') sessionId: string, @CurrentUser() user: AuthUser): Promise<void> {
    await this.deleteStudentSessionUseCase.execute(sessionId, user);
  }
}
