import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { GetStudentByUserIdUseCase } from 'src/application/student/get-student-by-user-id.use-case';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { GlobalErrorFilter } from 'src/presentation/filters/shared.filter';
import { CreateStudentUseCase } from 'src/application/student/create-student.use-case';
import { GetStudentJoinedSessionsUseCase } from 'src/application/student/get-student-joined-sessions.use-case';
import {
  SessionStudent,
  Student,
  StudentJoinedSession,
} from 'src/domain/teaching/types/student.type';
import { JoinSessionByCodeUseCase } from 'src/application/student/join-session-by-code.use-case';
import { GetSessionStudentUseCase } from 'src/application/student/get-session-student.use-case';
import { GetStudentBatchBodyDto } from '../dto/student/get-student-batch.dto';
import { GetStudentBatchUseCase } from 'src/application/student/get-student-batch.use-case';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('student')
@UseFilters(GlobalErrorFilter)
@Controller('student')
export class StudentController {
  constructor(
    private readonly getStudentByUserIdUseCase: GetStudentByUserIdUseCase,
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly getStudentJoinedSessionsUseCase: GetStudentJoinedSessionsUseCase,
    private readonly joinSessionByCodeUseCase: JoinSessionByCodeUseCase,
    private readonly getSessionStudentUseCase: GetSessionStudentUseCase,
    private readonly getStudentBatchUseCase: GetStudentBatchUseCase,
  ) {}

  @Get()
  async getStudentByUserId(@Req() req: Request & { user: AuthUser }) {
    const { user } = req;
    const student = await this.getStudentByUserIdUseCase.execute(user.id);
    return student;
  }

  @Post()
  async createStudent(@Req() req: Request & { user: AuthUser }) {
    const { user } = req;
    const student = await this.createStudentUseCase.execute(user);
    return student;
  }

  @Get(':studentId/joined-sessions')
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
    @Req() req: Request & { user: AuthUser },
  ): Promise<void> {
    const { user } = req;
    await this.joinSessionByCodeUseCase.execute(code, user.id);
  }

  @Roles('teacher', 'establishment')
  @Get('/session/:sessionId')
  async getStudentSessions(
    @Param('sessionId') sessionId: string,
    @Req() req: Request & { user: AuthUser },
  ): Promise<SessionStudent[]> {
    const { user } = req;

    const students = await this.getSessionStudentUseCase.execute(
      sessionId,
      user,
    );
    return students ?? [];
  }

  @Roles('establishment')
  @Post('batch')
  async getStudentBatch(
    @Body() body: GetStudentBatchBodyDto,
    @Req() req: Request & { user: AuthUser },
  ): Promise<Student[]> {
    const students = await this.getStudentBatchUseCase.execute(body);
    return students ?? [];
  }
}
