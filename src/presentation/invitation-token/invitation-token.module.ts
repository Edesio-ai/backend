import { Module } from '@nestjs/common';
import { DeleteInvitationTokenUseCase } from 'src/application/establishment/delete-invitation-token.use-case';
import { GetInvitationTokenUseCase } from 'src/application/establishment/get-invitation-token.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { InvitationTokenController } from './invitation-token.controller';
import { TokenPersistenceModule } from 'src/infrastructure/supabase/token/token-persistence.module';
import { ValidateTeacherInvitationUseCase } from 'src/application/teacher/validate-teacher-invitation.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    EstablishmentPersistenceModule,
    TokenPersistenceModule,
    TeacherPersistenceModule,
  ],
  controllers: [InvitationTokenController],
  providers: [
    GetInvitationTokenUseCase,
    DeleteInvitationTokenUseCase,
    ValidateTeacherInvitationUseCase,
  ],
})
export class InvitationTokenModule {}
