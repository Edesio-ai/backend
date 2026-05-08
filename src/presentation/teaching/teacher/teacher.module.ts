import { Module } from '@nestjs/common';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { GetTeacherByUserIdUseCase } from 'src/application/teaching/teacher/get-teacher-by-user-id.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { CreateTeacherUseCase } from 'src/application/teaching/teacher/create-teacher.use-case';
import { TeacherController } from 'src/presentation/teaching/teacher/teacher.controller';

@Module({
  imports: [AuthPersistenceModule, TeacherPersistenceModule],
  controllers: [TeacherController],
  providers: [GetTeacherByUserIdUseCase, CreateTeacherUseCase],
})
export class TeacherModule {}
