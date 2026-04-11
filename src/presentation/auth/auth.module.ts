import { Module } from '@nestjs/common';

import { GenerateCsrfTokenUseCase } from '../../application/auth/generate-csrf-token.use-case';
import { NodeTokenGeneratorProvider } from '../../infrastructure/security/node-token-generator.provider';
import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { MailerModule } from '../../infrastructure/mailer/mailer.module';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { SendInvitationUseCase } from '../../application/auth/send-invitation.use-case';
import { AuthPersistenceModule } from '../../infrastructure/persistence/supabase/auth/auth-persistence.module';
import { TOKEN_GENERATOR } from '../../domain/shared/security/interface/token-generator.provider';
import { AuthController } from './auth.controller';
import { GetUserSessionUseCase } from '../../application/auth/get-user-session.use-case';
import { LogoutUseCase } from '../../application/auth/logout.use-case';
import { CreateInvitationTokenUseCase } from '../../application/auth/create-invitation-toke.use-case';

@Module({
  imports: [AuthPersistenceModule, MailerModule],
  controllers: [AuthController],
  providers: [
    {
      provide: TOKEN_GENERATOR,
      useClass: NodeTokenGeneratorProvider,
    },
    GenerateCsrfTokenUseCase,
    GetInvitationPreviewUseCase,
    RegisterUseCase,
    LoginUseCase,
    SendInvitationUseCase,
    GetUserSessionUseCase,
    LogoutUseCase,
    CreateInvitationTokenUseCase,
  ],
})
export class AuthModule {}
