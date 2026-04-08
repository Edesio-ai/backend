import { Module } from '@nestjs/common';
import { TeacherPersistenceModule } from '../../infrastructure/persistence/supabase/teacher/teacher-persistence.module';
import { TeacherController } from './teacher.controller';
import { GetTeacherByUserIdUseCase } from '../../application/teacher/get-teacher-by-user-id';
import { TokenPersistenceModule } from '../../infrastructure/persistence/supabase/token/token-persistence.module';
import { AuthPersistenceModule } from '../../infrastructure/persistence/supabase/auth/auth-persistence.module';
import { CreateTeacherUseCase } from '../../application/teacher/create-teacher.use-case';
import { ValidateTeacherInvitationUseCase } from '../../application/teacher/validate-teacher-invitation.use-case';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    TokenPersistenceModule,
  ],
  controllers: [TeacherController],
  providers: [
    GetTeacherByUserIdUseCase,
    CreateTeacherUseCase,
    ValidateTeacherInvitationUseCase,
  ],
})
export class TeacherModule {}
