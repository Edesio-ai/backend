import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { StudentJoinedSession } from 'src/domain/teaching/types/student.type';
import { GetStudentJoinedSessionsUseCase } from 'src/application/teaching/student-session/get-student-joined-sessions.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { JoinSessionByCodeUseCase } from 'src/application/teaching/student-session/join-session-by-code.use-case';
import { SessionStudent } from 'src/domain/teaching/types/student.type';
import { GetSessionStudentUseCase } from 'src/application/teaching/student-session/get-session-student.use-case';
import { DeleteStudentSessionUseCase } from 'src/application/teaching/student-session/delete-student-session.use-case';

@Roles('student')
@Controller('student-session')
export class StudentSessionController {
  constructor(
    private readonly getStudentJoinedSessionsUseCase: GetStudentJoinedSessionsUseCase,
    private readonly joinSessionByCodeUseCase: JoinSessionByCodeUseCase,
    private readonly getSessionStudentUseCase: GetSessionStudentUseCase,
    private readonly deleteStudentSessionUseCase: DeleteStudentSessionUseCase,
  ) {}

  @Get('student/:studentId/joined-sessions')
  async getStudentJoinedSessions(
    @Param('studentId') studentId: string,
  ): Promise<StudentJoinedSession[]> {
    const student =
      await this.getStudentJoinedSessionsUseCase.execute(studentId);
    return student;
  }

  @Post('join-session/:code')
  async joinSessionByCode(
    @Param('code') code: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.joinSessionByCodeUseCase.execute(code, user.id);
  }

  @Roles('teacher', 'establishment')
  @Get('/session/:sessionId')
  async getStudentSessions(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<SessionStudent[]> {
    const students = await this.getSessionStudentUseCase.execute(
      sessionId,
      user,
    );
    return students ?? [];
  }

  @Delete('session/:sessionId')
  async deleteStudentSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.deleteStudentSessionUseCase.execute(sessionId, user);
  }
}
