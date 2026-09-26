import { Module } from '@nestjs/common';
import { DeleteInvitationTokenUseCase } from 'src/application/teaching/invitation-token/delete-invitation-token.use-case';
import { GetInvitationTokenUseCase } from 'src/application/teaching/invitation-token/get-invitation-token.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { InvitationTokenController } from './invitation-token.controller';
import { InvitationTokenPersistenceModule } from 'src/infrastructure/supabase/invitation-token/invitation-token-persistence.module';
import { ValidateTeacherInvitationUseCase } from 'src/application/teaching/invitation-token/validate-teacher-invitation.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { GetInvitationPreviewUseCase } from 'src/application/teaching/invitation-token/get-invitation-preview.use-case';
import { CreateInvitationTokenUseCase } from 'src/application/teaching/invitation-token/create-invitation-token.use-case';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/establishment/establishment-persistence.module';
import { MailerModule } from 'src/infrastructure/mailer/mailer.module';

@Module({
  imports: [
    AuthPersistenceModule,
    InvitationTokenPersistenceModule,
    TeacherPersistenceModule,
    EstablishmentPersistenceModule,
    MailerModule,
  ],
  controllers: [InvitationTokenController],
  providers: [
    GetInvitationTokenUseCase,
    DeleteInvitationTokenUseCase,
    ValidateTeacherInvitationUseCase,
    GetInvitationPreviewUseCase,
    CreateInvitationTokenUseCase,
  ],
})
export class InvitationTokenModule {}
