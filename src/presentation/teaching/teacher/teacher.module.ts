import { Module } from '@nestjs/common';
import { TeacherPersistenceModule } from '../../../infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { GetTeacherByUserIdUseCase } from '../../../application/teacher/get-teacher-by-user-id.use-case';
import { AuthPersistenceModule } from '../../../infrastructure/supabase/auth/auth-persistence.module';
import { CreateTeacherUseCase } from '../../../application/teacher/create-teacher.use-case';
import { TeacherController } from '../teacher/teacher.controller';

@Module({
  imports: [AuthPersistenceModule, TeacherPersistenceModule],
  controllers: [TeacherController],
  providers: [GetTeacherByUserIdUseCase, CreateTeacherUseCase],
})
export class TeacherModule {}
