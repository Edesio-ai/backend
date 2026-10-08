import { Body, Controller, Get, Post } from '@nestjs/common';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { GetStudentByUserIdUseCase } from 'src/application/teaching/student/get-student-by-user-id.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { CreateStudentUseCase } from 'src/application/teaching/student/create-student.use-case';
import { Student } from 'src/domain/teaching/student/type/student.type';
import { GetStudentBatchBodyDto } from './dtos/get-student-batch.dto';
import { GetStudentBatchUseCase } from 'src/application/teaching/student/get-student-batch.use-case';

@Controller('student')
@Roles('student')
export class StudentController {
  constructor(
    private readonly getStudentByUserIdUseCase: GetStudentByUserIdUseCase,
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly getStudentBatchUseCase: GetStudentBatchUseCase,
  ) {}

  @Get()
  async getStudentByUserId(@CurrentUser() user: AuthUser) {
    const student = await this.getStudentByUserIdUseCase.execute(user.id);
    return student;
  }

  @Post()
  async createStudent(@CurrentUser() user: AuthUser) {
    const student = await this.createStudentUseCase.execute(user);
    return student;
  }

  @Roles('establishment')
  @Post('batch')
  async getStudentBatch(@Body() body: GetStudentBatchBodyDto): Promise<Student[]> {
    const students = await this.getStudentBatchUseCase.execute(body);
    return students ?? [];
  }
}
