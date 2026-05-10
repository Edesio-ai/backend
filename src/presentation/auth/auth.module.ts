import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { GenerateCsrfTokenUseCase } from '../../application/auth/generate-csrf-token.use-case';
import { NodeTokenGeneratorProvider } from '../../infrastructure/security/node-token-generator.provider';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { MailerModule } from '../../infrastructure/mailer/mailer.module';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { AuthPersistenceModule } from '../../infrastructure/supabase/auth/auth-persistence.module';
import { TOKEN_GENERATOR } from '../../domain/shared/security/interface/token-generator.provider';
import { AuthController } from './auth.controller';
import { GetUserSessionUseCase } from '../../application/auth/get-user-session.use-case';
import { LogoutUseCase } from '../../application/auth/logout.use-case';
import { AppHttpSecurityGuard } from './guards/app-http-security.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { InvitationTokenPersistenceModule } from 'src/infrastructure/supabase/invitation-token/invitation-token-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    MailerModule,
    TeacherPersistenceModule,
    InvitationTokenPersistenceModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: TOKEN_GENERATOR,
      useClass: NodeTokenGeneratorProvider,
    },
    JwtAuthGuard,
    RolesGuard,
    CsrfGuard,
    AppHttpSecurityGuard,
    { provide: APP_GUARD, useClass: AppHttpSecurityGuard },
    GenerateCsrfTokenUseCase,
    RegisterUseCase,
    LoginUseCase,
    GetUserSessionUseCase,
    LogoutUseCase,
  ],
})
export class AuthModule {}
