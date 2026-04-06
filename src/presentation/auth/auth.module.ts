import { Module } from '@nestjs/common';

import { GenerateCsrfTokenUseCase } from '../../application/auth/generate-csrf-token.use-case';
import { NodeTokenGeneratorProvider } from '../../infrastructure/security/node-token-generator.provider';
import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { SignUpTeacherUseCase } from '../../application/auth/sign-up-teacher.use-case';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { MailerModule } from '../../infrastructure/mailer/mailer.module';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { SendInvitationUseCase } from '../../application/auth/send-invitation.use-case';
import { authPersistenceModule } from '../../infrastructure/persistence/supabase/auth/auth-persistence.module';
import { TOKEN_GENERATOR } from '../../interfaces/security/token-generator.provider';
import { AuthController } from './auth.controller';
import { GetUserSessionUseCase } from '../../application/auth/get-user-session.use-case';
import { LogoutUseCase } from '../../application/auth/logout.use-case';
import { CreateInvitationTokenUseCase } from '../../application/auth/create-invitation-toke.use-case';


@Module({
  imports: [
    authPersistenceModule,
    MailerModule
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: TOKEN_GENERATOR,
      useClass: NodeTokenGeneratorProvider,
    },
    GenerateCsrfTokenUseCase,
    GetInvitationPreviewUseCase,
    SignUpTeacherUseCase,
    RegisterUseCase,
    LoginUseCase,
    SendInvitationUseCase,
    GetUserSessionUseCase,
    LogoutUseCase,
    CreateInvitationTokenUseCase
  ],
})

export class AuthModule { }