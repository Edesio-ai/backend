import { Module } from '@nestjs/common';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { GetTeacherByUserIdUseCase } from 'src/application/teaching/teacher/get-teacher-by-user-id.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { CreateTeacherUseCase } from 'src/application/teaching/teacher/create-teacher.use-case';
import { TeacherController } from 'src/presentation/teaching/teacher/teacher.controller';
import { DeleteTeacherUseCase } from 'src/application/teaching/teacher/delete-teacher.use-case';

@Module({
  imports: [AuthPersistenceModule, TeacherPersistenceModule],
  controllers: [TeacherController],
  providers: [GetTeacherByUserIdUseCase, CreateTeacherUseCase, DeleteTeacherUseCase],
})
export class TeacherModule {}
