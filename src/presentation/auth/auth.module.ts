import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { authPersistenceModule } from '../../infrastructure/persistence/supabase/auth-persistence.module';
import { SignUpTeacherUseCase } from '../../application/auth/sign-up-teacher.use-case';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { MailerModule } from 'src/infrastructure/mailer/mailer.module';


@Module({
  imports: [
    authPersistenceModule,
    MailerModule
  ],
  controllers: [AuthController],
  providers: [
    GetInvitationPreviewUseCase,
    SignUpTeacherUseCase,
    RegisterUseCase
  ],
})

export class AuthModule { }
