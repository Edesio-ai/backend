import { Module } from '@nestjs/common';
import { TeacherPersistenceModule } from '../../infrastructure/persistence/supabase/teacher/teacher-persistence.module';
import { TeacherController } from './teacher.controller';
import { GetTeacherByUserIdUseCase } from '../../application/teacher/get-teacher-by-user-id.use-case';
import { TokenPersistenceModule } from '../../infrastructure/persistence/supabase/token/token-persistence.module';
import { AuthPersistenceModule } from '../../infrastructure/persistence/supabase/auth/auth-persistence.module';
import { CreateTeacherUseCase } from '../../application/teacher/create-teacher.use-case';
import { ValidateTeacherInvitationUseCase } from '../../application/teacher/validate-teacher-invitation.use-case';
import { SessionsPersistenceModule } from '../../infrastructure/persistence/supabase/session/sessions-persistence.module';
import { GetTeacherSessionsUseCase } from '../../application/teacher/get-teacher-sessions.use-case';
import { GetSessionByCodeUseCase } from 'src/application/teacher/get-session-by-code.use-case';
import { CreateSessionUseCase } from 'src/application/teacher/create-session.use-case';

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
    GetTeacherSessionsUseCase,
    GetSessionByCodeUseCase,
    CreateSessionUseCase,
  ],
})
export class TeacherModule {}
