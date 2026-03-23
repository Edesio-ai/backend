import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { authPersistenceModule } from '../../infrastructure/persistence/supabase/auth-persistence.module';
import { SignUpTeacherUseCase } from '../../application/auth/sign-up-teacher.use-case';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { MailerModule } from '../../infrastructure/mailer/mailer.module';
import { LoginUseCase } from '../../application/auth/login.use-case';


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
    LoginUseCase
  ],
})

export class AuthModule { }
