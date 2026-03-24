import { Module } from '@nestjs/common';

import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { SignUpTeacherUseCase } from '../../application/auth/sign-up-teacher.use-case';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { MailerModule } from '../../infrastructure/mailer/mailer.module';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { SendInvitationUseCase } from '../../application/auth/send-invitation.use-case';
import { authPersistenceModule } from '../../infrastructure/persistence/supabase/auth-persistence.module';
import { AuthController } from './auth.controller';


@Module({
  imports: [
    authPersistenceModule,
    MailerModule
  ],
  controllers: [AuthController],
  providers: [
    GetInvitationPreviewUseCase,
    SignUpTeacherUseCase,
    RegisterUseCase,
    LoginUseCase,
    SendInvitationUseCase
  ],
})

export class AuthModule { }