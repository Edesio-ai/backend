import { Module } from '@nestjs/common';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { StudentController } from '../controllers/student.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetStudentByUserIdUseCase } from 'src/application/student/get-student-by-user-id.use-case';
import { CreateStudentUseCase } from 'src/application/student/create-student.use-case';

@Module({
  imports: [AuthPersistenceModule, StudentPersistenceModule],
  controllers: [StudentController],
  providers: [GetStudentByUserIdUseCase, CreateStudentUseCase],
})
export class StudentModule {}
