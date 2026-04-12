import { Module } from '@nestjs/common';
import { TeacherPersistenceModule } from '../../../infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { GetTeacherByUserIdUseCase } from '../../../application/teacher/get-teacher-by-user-id.use-case';
import { TokenPersistenceModule } from '../../../infrastructure/supabase/token/token-persistence.module';
import { AuthPersistenceModule } from '../../../infrastructure/supabase/auth/auth-persistence.module';
import { CreateTeacherUseCase } from '../../../application/teacher/create-teacher.use-case';
import { ValidateTeacherInvitationUseCase } from '../../../application/teacher/validate-teacher-invitation.use-case';
import { SessionsPersistenceModule } from '../../../infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { TeacherController } from '../controllers/teacher.controller';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    TokenPersistenceModule,
    SessionsPersistenceModule,
  ],
  controllers: [TeacherController],
  providers: [
    GetTeacherByUserIdUseCase,
    CreateTeacherUseCase,
    ValidateTeacherInvitationUseCase,
  ],
})
export class TeacherModule {}
