import { Module } from '@nestjs/common';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { StudentController } from '../student/student.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetStudentByUserIdUseCase } from 'src/application/teaching/student/get-student-by-user-id.use-case';
import { CreateStudentUseCase } from 'src/application/teaching/student/create-student.use-case';
import { GetStudentBatchUseCase } from 'src/application/teaching/student/get-student-batch.use-case';

@Module({
  imports: [AuthPersistenceModule, StudentPersistenceModule],
  controllers: [StudentController],
  providers: [GetStudentByUserIdUseCase, CreateStudentUseCase, GetStudentBatchUseCase],
})
export class StudentModule {}
